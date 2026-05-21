import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL  || '';
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Auth ──────────────────────────────────────────────────────

export async function signUp({ email, password, name, phone }) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { name, phone } },
  });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ── Profiles ──────────────────────────────────────────────────

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export async function upsertProfile(profile) {
  const { data, error } = await supabase
    .from('profiles').upsert(profile).select().single();
  if (error) throw error;
  return data;
}

export async function uploadAvatar(userId, file) {
  const ext  = file.name.split('.').pop();
  const path = `${userId}/avatar.${ext}`;
  await supabase.storage.from('avatars').upload(path, file, { upsert: true });
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, phone, level, years_playing, avatar_url, points')
    .order('points', { ascending: false });
  if (error) throw error;
  return data;
}

// ── Bookings ──────────────────────────────────────────────────

export async function getBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, profiles(name, avatar_url)')
    .order('date').order('time');
  if (error) throw error;
  return data;
}

export async function createBooking(booking) {
  const { data, error } = await supabase
    .from('bookings').insert(booking).select().single();
  if (error) throw error;
  return data;
}

export async function cancelBooking(id) {
  const { error } = await supabase.from('bookings').delete().eq('id', id);
  if (error) throw error;
}

// ── Chats ─────────────────────────────────────────────────────

export async function getOrCreateChat(userA, userB, postId = null) {
  const { data: existing } = await supabase
    .from('chats').select('*')
    .or(`and(user_a.eq.${userA},user_b.eq.${userB}),and(user_a.eq.${userB},user_b.eq.${userA})`)
    .maybeSingle();
  if (existing) return existing;
  const { data, error } = await supabase
    .from('chats').insert({ user_a: userA, user_b: userB, post_id: postId }).select().single();
  if (error) throw error;
  return data;
}

export async function getChats(userId) {
  const { data, error } = await supabase
    .from('chats')
    .select('*, chat_messages(*)')
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function sendMessage({ chatId, senderId, text }) {
  const { data, error } = await supabase
    .from('chat_messages').insert({ chat_id: chatId, sender_id: senderId, text }).select().single();
  if (error) throw error;
  await supabase.from('chats').update({ updated_at: new Date().toISOString() }).eq('id', chatId);
  return data;
}
