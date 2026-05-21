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

import { COURTS } from './data/data';
import { INITIAL_POSTS, INITIAL_CHATS } from './data/teamup';

import {
  supabase,
  signOut,
  getProfile,
  upsertProfile,
  uploadAvatar,
  getBookings,
  createBooking,
  cancelBooking,
} from './lib/supabase';

export default function App() {
  const [user,     setUser]     = useState(null);
  const [profile,  setProfile]  = useState(null);
  const [tab,      setTab]      = useState('home');
  const [bookings, setBookings] = useState([]);
  const [booking,  setBooking]  = useState(null);
  const [lang,     setLang]     = useState('zh');
  const [posts,    setPosts]    = useState(INITIAL_POSTS);
  const [chats,    setChats]    = useState(INITIAL_CHATS);
  const [loading,  setLoading]  = useState(true);

  // ── 初始化：检查是否已登录 ────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) await loadUser(session.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null); setProfile(null); setBookings([]); setTab('home');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadUser(authUser) {
    const tryLoad = async () => {
      const prof = await getProfile(authUser.id);
      setUser({ id: authUser.id, name: prof.name, email: authUser.email });
      setProfile({ ...prof, email: authUser.email });
      await loadBookings();
    };
    try {
      await tryLoad();
    } catch {
      setTimeout(async () => { try { await tryLoad(); } catch (e) { console.error(e); } }, 1500);
    }
  }

  async function loadBookings() {
    try {
      const data = await getBookings();
      setBookings(data.map(b => ({
        id: b.id, court: b.court, date: b.date, time: b.time,
        dur: b.dur, people: b.people, modeKey: b.mode_key,
        member: b.profiles?.name || '', userId: b.user_id,
      })));
    } catch (e) { console.error('Load bookings:', e); }
  }

  // ── Auth ──────────────────────────────────────────────────
  function handleLogin() { setTab('home'); }

  async function handleLogout() {
    await signOut();
  }

  // ── Profile ───────────────────────────────────────────────
  async function handleSaveProfile(updates) {
    try {
      const updated = await upsertProfile({ id: user.id, ...updates });
      setProfile(prev => ({ ...prev, ...updated }));
      setUser(prev => ({ ...prev, name: updates.name }));
    } catch (e) { console.error(e); }
  }

  async function handleAvatarChange(file) {
    try {
      const url = await uploadAvatar(user.id, file);
      await upsertProfile({ id: user.id, avatar_url: url });
      setProfile(prev => ({ ...prev, avatar_url: url }));
    } catch {
      setProfile(prev => ({ ...prev, avatar_url: URL.createObjectURL(file) }));
    }
  }

  // ── Bookings ──────────────────────────────────────────────
  function handleSelectCourt(court) {
    setBooking({ court, prefTime: '' }); setTab('booking');
  }
  function handleBookFromSchedule(courtId, time) {
    const court = COURTS.find(c => c.id === courtId);
    setBooking({ court, prefTime: time }); setTab('booking');
  }

  async function handleConfirm(newBooking) {
    try {
      await createBooking({
        user_id: user.id, court: newBooking.court,
        date: newBooking.date, time: newBooking.time,
        dur: newBooking.dur, people: newBooking.people,
        mode_key: newBooking.modeKey,
      });
      await loadBookings();
      setProfile(prev => ({ ...prev, points: (prev?.points || 0) + 10 }));
    } catch (e) {
      console.error(e);
      setBookings(prev => [...prev, { ...newBooking, member: user.name, isMe: true }]);
    }
  }

  async function handleCancel(target) {
    try {
      if (target.id) await cancelBooking(target.id);
      await loadBookings();
    } catch {
      setBookings(prev => prev.filter(b =>
        !(b.court === target.court && b.date === target.date && b.time === target.time)
      ));
    }
  }

  // ── TeamUp ────────────────────────────────────────────────
  function handleBookFromPost(post) {
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'matched' } : p));
    const allMembers = [...new Set([post.author, ...(post.applicants || [])])];
    setBookings(prev => [...prev, ...allMembers.map(member => ({
      court: COURTS[0].id, date: post.date, time: post.timeFrom, dur: '1h',
      people: post.type === 'doubles' ? 4 : 2,
      modeKey: post.type === 'doubles' ? 'doubles' : 'singles',
      member, isMe: member === user?.name,
    }))]);
    setProfile(prev => ({ ...prev, points: (prev?.points || 0) + 10 }));
    setTab('mybookings');
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
    const timeStr = new Date().toTimeString().slice(0, 5);
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

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:16 }}>
        <div style={{ width:40, height:40, border:'3px solid #E8E4D8', borderTop:'3px solid #C9A96E', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color:'#888', fontSize:14 }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} lang={lang} onLangChange={setLang} />;
  }

  return (
    <div>
      <Navbar userName={user.name} activeTab={tab}
        onTabChange={t => { setTab(t); setBooking(null); }}
        onLogout={handleLogout} lang={lang} onLangChange={setLang} />
      {tab === 'home' && <HomePage bookings={bookings} userName={user.name} onSelectCourt={handleSelectCourt} lang={lang} />}
      {tab === 'booking' && booking && <BookingPage court={booking.court} bookings={bookings} userName={user.name} onBack={() => setTab('home')} onConfirm={handleConfirm} lang={lang} />}
      {tab === 'schedule' && <SchedulePage bookings={bookings} userName={user.name} onBook={handleBookFromSchedule} lang={lang} />}
      {tab === 'mybookings' && <MyBookingsPage bookings={bookings} userName={user.name} onCancel={handleCancel} lang={lang} />}
      {tab === 'teamup' && <TeamUpPage posts={posts} chats={chats} userName={user.name} lang={lang} onAddPost={handleAddPost} onApply={handleApply} onSendMsg={handleSendMsg} onBookCourt={handleBookFromPost} />}
      {tab === 'profile' && <ProfilePage profile={{ ...profile, email: user.email }} bookings={bookings} posts={posts} lang={lang} onSave={handleSaveProfile} onAvatarChange={handleAvatarChange} />}
    </div>
  );
}
