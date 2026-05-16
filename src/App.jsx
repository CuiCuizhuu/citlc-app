import { useState } from 'react';
import './index.css';

import AuthPage       from './pages/AuthPage';
import HomePage       from './pages/HomePage';
import BookingPage    from './pages/BookingPage';
import SchedulePage   from './pages/SchedulePage';
import MyBookingsPage from './pages/MyBookingsPage';
import TeamUpPage     from './pages/TeamUpPage';
import Navbar         from './components/Navbar';

import { INITIAL_BOOKINGS, COURTS } from './data/data';
import { INITIAL_POSTS, INITIAL_CHATS } from './data/teamup';

export default function App() {
  const [user,     setUser]     = useState(null);
  const [tab,      setTab]      = useState('home');
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [booking,  setBooking]  = useState(null);
  const [lang,     setLang]     = useState('zh');
  const [posts,    setPosts]    = useState(INITIAL_POSTS);
  const [chats,    setChats]    = useState(INITIAL_CHATS);

  function handleLogin(name)  { setUser(name); setTab('home'); }
  function handleLogout()     { setUser(null); setBooking(null); setTab('home'); }

  function handleSelectCourt(court) { setBooking({ court, prefTime:'' }); setTab('booking'); }

  function handleBookFromSchedule(courtId, time) {
    const court = COURTS.find(c => c.id === courtId);
    setBooking({ court, prefTime: time });
    setTab('booking');
  }

  function handleConfirm(newBooking) { setBookings(prev => [...prev, newBooking]); }

  function handleCancel(target) {
    setBookings(prev => prev.filter(b =>
      !(b.court === target.court && b.date === target.date && b.time === target.time)
    ));
  }

  // TeamUp: book court from a post
  function handleBookFromPost(post) {
    const court = COURTS[0]; // default Court 1; user picks in booking flow
    setBooking({ court, prefTime: post.timeFrom });
    setTab('booking');
  }

  // TeamUp: add new availability post
  function handleAddPost(post) {
    setPosts(prev => [post, ...prev]);
  }

  // TeamUp: apply to a post (adds user to applicants + opens chat)
  function handleApply(postId, applicant) {
    setPosts(prev => prev.map(p =>
      p.id === postId && !p.applicants.includes(applicant)
        ? { ...p, applicants: [...p.applicants, applicant] }
        : p
    ));
  }

  // TeamUp: send message, create chat if doesn't exist
  function handleSendMsg(chatWith, text, from) {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const newMsg = { from, text, time: timeStr };

    setChats(prev => {
      const existing = prev.find(c =>
        c.participants.includes(from) && c.participants.includes(chatWith.otherUser)
      );
      if (existing) {
        return prev.map(c => c.id === existing.id
          ? { ...c, messages: [...c.messages, newMsg] }
          : c
        );
      } else {
        return [...prev, {
          id: 'c' + Date.now(),
          participants: [from, chatWith.otherUser],
          postId: chatWith.postId,
          messages: [newMsg],
        }];
      }
    });
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} lang={lang} onLangChange={setLang} />;
  }

  return (
    <div>
      <Navbar
        userName={user} activeTab={tab}
        onTabChange={t => { setTab(t); setBooking(null); }}
        onLogout={handleLogout}
        lang={lang} onLangChange={setLang}
      />

      {tab === 'home' && (
        <HomePage bookings={bookings} userName={user} onSelectCourt={handleSelectCourt} lang={lang} />
      )}
      {tab === 'booking' && booking && (
        <BookingPage court={booking.court} bookings={bookings} userName={user}
          onBack={() => setTab('home')} onConfirm={handleConfirm} lang={lang} />
      )}
      {tab === 'schedule' && (
        <SchedulePage bookings={bookings} userName={user} onBook={handleBookFromSchedule} lang={lang} />
      )}
      {tab === 'mybookings' && (
        <MyBookingsPage bookings={bookings} userName={user} onCancel={handleCancel} lang={lang} />
      )}
      {tab === 'teamup' && (
        <TeamUpPage
          posts={posts} chats={chats} userName={user} lang={lang}
          onAddPost={handleAddPost}
          onApply={handleApply}
          onSendMsg={handleSendMsg}
          onBookCourt={handleBookFromPost}
        />
      )}
    </div>
  );
}
