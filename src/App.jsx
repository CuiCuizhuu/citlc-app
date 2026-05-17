import { useState, useEffect } from 'react';
import './index.css';

import AuthPage       from './pages/AuthPage';
import HomePage       from './pages/HomePage';
import BookingPage    from './pages/BookingPage';
import SchedulePage   from './pages/SchedulePage';
import MyBookingsPage from './pages/MyBookingsPage';
import TeamUpPage     from './pages/TeamUpPage';
import ProfilePage    from './pages/ProfilePage';
import Navbar         from './components/Navbar';

import { INITIAL_BOOKINGS, COURTS } from './data/data';
import { INITIAL_POSTS, INITIAL_CHATS } from './data/teamup';

// ── Supabase (swap in when ready) ────────────────────────────
// import { supabase, signIn, signUp, signOut, getProfile,
//          upsertProfile, uploadAvatar, getBookings,
//          createBooking, cancelBooking } from './lib/supabase';

export default function App() {
  const [user,     setUser]     = useState(null);    // { id, name, email }
  const [profile,  setProfile]  = useState(null);    // full profile object
  const [tab,      setTab]      = useState('home');
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [booking,  setBooking]  = useState(null);
  const [lang,     setLang]     = useState('zh');
  const [posts,    setPosts]    = useState(INITIAL_POSTS);
  const [chats,    setChats]    = useState(INITIAL_CHATS);

  // ── Auth ─────────────────────────────────────────────────────
  function handleLogin(name, email) {
    const u = { id: Date.now().toString(), name, email };
    setUser(u);
    setProfile({
      id: u.id, name, email,
      phone: '', level: 'intermediate', years_playing: 2,
      bio: '', avatar_url: null, points: 30,
    });
    setTab('home');
  }

  function handleLogout() {
    setUser(null); setProfile(null);
    setBooking(null); setTab('home');
  }

  // ── Profile ──────────────────────────────────────────────────
  async function handleSaveProfile(updates) {
    setProfile(prev => ({ ...prev, ...updates }));
    setUser(prev => ({ ...prev, name: updates.name }));
    // With Supabase: await upsertProfile({ id: user.id, ...updates });
  }

  async function handleAvatarChange(file) {
    // With Supabase: const url = await uploadAvatar(user.id, file);
    // For now: use local object URL preview
    const url = URL.createObjectURL(file);
    setProfile(prev => ({ ...prev, avatar_url: url }));
  }

  // ── Bookings ─────────────────────────────────────────────────
  function handleSelectCourt(court) { setBooking({ court, prefTime:'' }); setTab('booking'); }

  function handleBookFromSchedule(courtId, time) {
    const court = COURTS.find(c => c.id === courtId);
    setBooking({ court, prefTime: time });
    setTab('booking');
  }

  function handleConfirm(newBooking) {
    setBookings(prev => [...prev, newBooking]);
    // With Supabase: await createBooking({ ...newBooking, user_id: user.id });
    // Award points
    setProfile(prev => ({ ...prev, points: (prev?.points || 0) + 10 }));
  }

  function handleCancel(target) {
    setBookings(prev => prev.filter(b =>
      !(b.court === target.court && b.date === target.date && b.time === target.time)
    ));
    // With Supabase: await cancelBooking(target.id);
  }

  // ── TeamUp ───────────────────────────────────────────────────
  function handleBookFromPost(post) {
    // 组队成功 → 帖子状态改为 matched
    setPosts(prev => prev.map(p =>
      p.id === post.id ? { ...p, status: "matched" } : p
    ));

    // 给双方都创建预约记录
    const sharedBooking = {
      court: COURTS[0].id,
      date: post.date,
      time: post.timeFrom,
      dur: "1h",
      people: post.type === "doubles" ? 4 : 2,
      mode: post.type === "doubles" ? "双打" : "单打",
      modeKey: post.type === "doubles" ? "doubles" : "singles",
      isMe: false,
    };

    // 发帖人的预约
    const authorBooking = { ...sharedBooking, member: post.author, isMe: post.author === user.name };

    // 所有申请者的预约
    const applicantBookings = (post.applicants || []).map(applicant => ({
      ...sharedBooking,
      member: applicant,
      isMe: applicant === user.name,
    }));

    setBookings(prev => [...prev, authorBooking, ...applicantBookings]);

    // 积分奖励
    setProfile(prev => ({ ...prev, points: (prev?.points || 0) + 10 }));

    // 跳转到时刻表确认
    setTab("mybookings");
  }

  function handleAddPost(post) {
    setPosts(prev => [post, ...prev]);
    setProfile(prev => ({ ...prev, points: (prev?.points || 0) + 5 }));
  }

  function handleApply(postId, applicant) {
    setPosts(prev => prev.map(p =>
      p.id === postId && !p.applicants.includes(applicant)
        ? { ...p, applicants: [...p.applicants, applicant] } : p
    ));
  }

  function handleSendMsg(chatWith, text, from) {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    setChats(prev => {
      const existing = prev.find(c =>
        c.participants.includes(from) && c.participants.includes(chatWith.otherUser)
      );
      if (existing) {
        return prev.map(c => c.id === existing.id
          ? { ...c, messages: [...c.messages, { from, text, time: timeStr }] } : c
        );
      }
      return [...prev, {
        id: 'c' + Date.now(), participants: [from, chatWith.otherUser],
        postId: chatWith.postId, messages: [{ from, text, time: timeStr }],
      }];
    });
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} lang={lang} onLangChange={setLang} />;
  }

  return (
    <div>
      <Navbar
        userName={user.name} activeTab={tab}
        onTabChange={t => { setTab(t); setBooking(null); }}
        onLogout={handleLogout} lang={lang} onLangChange={setLang}
      />

      {tab === 'home' && (
        <HomePage bookings={bookings} userName={user.name} onSelectCourt={handleSelectCourt} lang={lang} />
      )}
      {tab === 'booking' && booking && (
        <BookingPage court={booking.court} bookings={bookings} userName={user.name}
          onBack={() => setTab('home')} onConfirm={handleConfirm} lang={lang} />
      )}
      {tab === 'schedule' && (
        <SchedulePage bookings={bookings} userName={user.name} onBook={handleBookFromSchedule} lang={lang} />
      )}
      {tab === 'mybookings' && (
        <MyBookingsPage bookings={bookings} userName={user.name} onCancel={handleCancel} lang={lang} />
      )}
      {tab === 'teamup' && (
        <TeamUpPage posts={posts} chats={chats} userName={user.name} lang={lang}
          onAddPost={handleAddPost} onApply={handleApply}
          onSendMsg={handleSendMsg} onBookCourt={handleBookFromPost}
        />
      )}
      {tab === 'profile' && (
        <ProfilePage
          profile={{ ...profile, email: user.email }}
          bookings={bookings} posts={posts} lang={lang}
          onSave={handleSaveProfile} onAvatarChange={handleAvatarChange}
        />
      )}
    </div>
  );
}
