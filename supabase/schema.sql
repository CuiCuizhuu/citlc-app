-- ============================================================
--  CITLC — Supabase 数据库建表脚本
--  使用方法：复制全部内容，粘贴到 Supabase → SQL Editor → Run
-- ============================================================

-- 1. 会员档案表
CREATE TABLE profiles (
  id            UUID REFERENCES auth.users(id) PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  level         TEXT DEFAULT 'intermediate'
                CHECK (level IN ('beginner','intermediate','advanced','pro')),
  years_playing INT  DEFAULT 1,
  bio           TEXT,
  avatar_url    TEXT,
  points        INT  DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 自动为新用户创建档案
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. 球场预约表
CREATE TABLE bookings (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  court      INT  NOT NULL CHECK (court BETWEEN 1 AND 4),
  date       TEXT NOT NULL,
  time       TEXT NOT NULL,
  dur        TEXT NOT NULL,
  people     INT  NOT NULL DEFAULT 2,
  mode_key   TEXT NOT NULL DEFAULT 'casual',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 防止同一球场同一时间重复预约
CREATE UNIQUE INDEX bookings_no_overlap ON bookings (court, date, time);

-- 3. 组队帖子表
CREATE TABLE teamup_posts (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date        TEXT NOT NULL,
  time_from   TEXT NOT NULL,
  time_to     TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('singles','doubles')),
  note        TEXT,
  status      TEXT DEFAULT 'open' CHECK (status IN ('open','matched','closed')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 组队申请表
CREATE TABLE teamup_applications (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id      UUID REFERENCES teamup_posts(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (post_id, applicant_id)
);

-- 5. 聊天室表
CREATE TABLE chats (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_a     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_b     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id    UUID REFERENCES teamup_posts(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 聊天消息表
CREATE TABLE chat_messages (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id    UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  Row Level Security (RLS) — 数据安全规则
-- ============================================================

ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE teamup_posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE teamup_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats               ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages       ENABLE ROW LEVEL SECURITY;

-- profiles: 所有会员可读，只能改自己的
CREATE POLICY "profiles_read_all"  ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_edit_own"  ON profiles FOR UPDATE USING (auth.uid() = id);

-- bookings: 所有会员可读，只能删自己的
CREATE POLICY "bookings_read_all"  ON bookings FOR SELECT USING (true);
CREATE POLICY "bookings_insert"    ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookings_delete"    ON bookings FOR DELETE USING (auth.uid() = user_id);

-- teamup_posts: 所有会员可读，只能改/删自己的
CREATE POLICY "posts_read_all"  ON teamup_posts FOR SELECT USING (true);
CREATE POLICY "posts_insert"    ON teamup_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_edit_own"  ON teamup_posts FOR UPDATE USING (auth.uid() = user_id);

-- applications: 所有会员可读，只能申请一次
CREATE POLICY "apps_read_all"  ON teamup_applications FOR SELECT USING (true);
CREATE POLICY "apps_insert"    ON teamup_applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);

-- chats: 只能看自己参与的
CREATE POLICY "chats_own" ON chats FOR ALL
  USING (auth.uid() = user_a OR auth.uid() = user_b);

-- messages: 只能看自己参与的聊天里的消息
CREATE POLICY "messages_own" ON chat_messages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM chats WHERE id = chat_id
    AND (user_a = auth.uid() OR user_b = auth.uid())
  ));

-- ============================================================
--  Storage — 头像上传
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

CREATE POLICY "avatars_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- ============================================================
--  积分触发器 — 预约完成后自动 +10 分
-- ============================================================

CREATE OR REPLACE FUNCTION award_booking_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET points = points + 10 WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_booking_created
  AFTER INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION award_booking_points();
