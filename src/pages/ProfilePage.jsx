import { useState, useRef } from 'react';
import { T } from '../data/i18n';
import { getDates } from '../data/dates';
import { COURTS } from '../data/data';
import './ProfilePage.css';

const COURT_MAP  = Object.fromEntries(COURTS.map(c => [c.id, c]));
const LEVEL_KEYS = ['beginner', 'intermediate', 'advanced', 'pro'];

export default function ProfilePage({ profile, bookings, posts, lang, onSave, onAvatarChange }) {
  const t  = T[lang];
  const tp = t.profile;

  const [editing, setEditing]   = useState(false);
  const [name,    setName]      = useState(profile?.name    || '');
  const [phone,   setPhone]     = useState(profile?.phone   || '');
  const [level,   setLevel]     = useState(profile?.level   || 'intermediate');
  const [years,   setYears]     = useState(profile?.years_playing || 1);
  const [bio,     setBio]       = useState(profile?.bio     || '');
  const [saving,  setSaving]    = useState(false);
  const [tab,     setTab]       = useState('stats');  // stats | bookings | teams
  const fileRef = useRef();

  const myBookings = (bookings || []).filter(b => b.member === profile?.name || b.isMe);
  const myPosts    = (posts    || []).filter(p => p.author === profile?.name);
  const today = getDates(lang)[0].full;

  // Stats
  const totalBookings   = myBookings.length;
  const completedGames  = myBookings.filter(b => b.date < today).length;
  const upcomingGames   = myBookings.filter(b => b.date >= today).length;
  const favoriteMode    = (() => {
    const counts = {};
    myBookings.forEach(b => { counts[b.mode] = (counts[b.mode] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
  })();
  const points = profile?.points || (completedGames * 10);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({ name, phone, level, years_playing: years, bio });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarClick() {
    fileRef.current?.click();
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) onAvatarChange(file);
  }

  const levelColor = { beginner:'#4A7C28', intermediate:'#C9A96E', advanced:'#4A6A9E', pro:'#8A2020' };

  return (
    <div className="profile-page">
      {/* Hero banner */}
      <div className="profile-hero">
        <div className="profile-avatar-wrap" onClick={handleAvatarClick} title={tp.changeAvatar}>
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt="avatar" className="profile-avatar-img" />
            : <div className="profile-avatar-placeholder">{(profile?.name || '?').slice(0, 1)}</div>
          }
          <div className="avatar-overlay">📷</div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFileChange} />
        </div>

        <div className="profile-hero-info">
          {editing ? (
            <input className="profile-name-input" value={name}
              onChange={e => setName(e.target.value)} placeholder={tp.namePh} />
          ) : (
            <h2 className="profile-name">{profile?.name || '—'}</h2>
          )}
          <div className="profile-level-row">
            <span className="profile-level-badge" style={{ background: levelColor[level] + '22', color: levelColor[level] }}>
              {tp.levels[level]}
            </span>
            <span className="profile-years">{years} {tp.yearsPlaying}</span>
          </div>
          <div className="profile-email">{profile?.email}</div>
        </div>

        <div className="profile-points-box">
          <div className="pts-num">{points}</div>
          <div className="pts-label">{tp.points}</div>
        </div>
      </div>

      {/* Edit / Save bar */}
      <div className="profile-action-bar">
        {editing ? (
          <>
            <button className="btn-outline" onClick={() => setEditing(false)}>{t.close}</button>
            <button className="btn-gold" style={{ flex:1 }} onClick={handleSave} disabled={saving}>
              {saving ? tp.saving : tp.save}
            </button>
          </>
        ) : (
          <button className="btn-outline profile-edit-btn" onClick={() => setEditing(true)}>
            ✏️ {tp.editProfile}
          </button>
        )}
      </div>

      {/* Edit fields */}
      {editing && (
        <div className="profile-edit-fields fade-up">
          <div className="field-group">
            <div className="field-label">{t.phone}</div>
            <input className="profile-field-input" value={phone}
              onChange={e => setPhone(e.target.value)} placeholder="138 0000 0000" />
          </div>
          <div className="field-group">
            <div className="field-label">{tp.level}</div>
            <div className="pill-row">
              {LEVEL_KEYS.map(k => (
                <button key={k} className={`pill ${level === k ? 'active' : ''}`}
                  onClick={() => setLevel(k)}>{tp.levels[k]}</button>
              ))}
            </div>
          </div>
          <div className="field-group">
            <div className="field-label">{tp.yearsLabel}</div>
            <div className="years-row">
              <button className="ppl-btn" onClick={() => setYears(y => Math.max(1, y - 1))}>−</button>
              <span className="ppl-num" style={{ fontSize:24 }}>{years}</span>
              <button className="ppl-btn" onClick={() => setYears(y => y + 1)}>+</button>
            </div>
          </div>
          <div className="field-group">
            <div className="field-label">{tp.bioLabel}</div>
            <textarea className="tu-textarea" rows={3} placeholder={tp.bioPh}
              value={bio} onChange={e => setBio(e.target.value)} />
          </div>
        </div>
      )}

      {/* Bio display */}
      {!editing && profile?.bio && (
        <div className="profile-bio">"{profile.bio}"</div>
      )}

      {/* Stats tabs */}
      <div className="profile-tabs">
        <button className={`profile-tab ${tab === 'stats'    ? 'on' : ''}`} onClick={() => setTab('stats')}>{tp.stats}</button>
        <button className={`profile-tab ${tab === 'bookings' ? 'on' : ''}`} onClick={() => setTab('bookings')}>{tp.bookHistory}</button>
        <button className={`profile-tab ${tab === 'teams'    ? 'on' : ''}`} onClick={() => setTab('teams')}>{tp.teamHistory}</button>
      </div>

      {/* Stats */}
      {tab === 'stats' && (
        <div className="stats-grid fade-up">
          <StatCard icon="🎾" value={totalBookings}  label={tp.totalGames} color="gold" />
          <StatCard icon="✅" value={completedGames} label={tp.completed}  color="green" />
          <StatCard icon="📅" value={upcomingGames}  label={tp.upcoming}   color="blue" />
          <StatCard icon="⭐" value={points}         label={tp.points}     color="gold" />
          <div className="stat-card wide">
            <div className="sc-icon">🏆</div>
            <div className="sc-value">{favoriteMode}</div>
            <div className="sc-label">{tp.favoriteMode}</div>
          </div>
          <div className="stat-card wide">
            <div className="sc-icon">📋</div>
            <div className="sc-value">{myPosts.length}</div>
            <div className="sc-label">{tp.postsCount}</div>
          </div>
        </div>
      )}

      {/* Booking history */}
      {tab === 'bookings' && (
        <div className="profile-list fade-up">
          {myBookings.length === 0 ? (
            <div className="tu-empty"><div className="tu-empty-icon">🎾</div><p>{tp.noBookings}</p></div>
          ) : (
            myBookings.map((b, i) => {
              const court  = COURT_MAP[b.court];
              const isPast = b.date < today;
              return (
                <div key={i} className={`profile-list-item ${isPast ? 'past' : 'upcoming'}`}>
                  <div className="pli-dot" style={{ background: isPast ? '#CCCCCC' : '#C9A96E' }} />
                  <div className="pli-info">
                    <div className="pli-title">{court?.name} · {b.date} · {b.time}</div>
                    <div className="pli-meta">{b.dur} · {b.people} p. · {b.mode}</div>
                  </div>
                  <span className={`mb-badge ${isPast ? 'past' : 'upcoming'}`}>
                    {isPast ? t.completed : t.upcoming}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Team history */}
      {tab === 'teams' && (
        <div className="profile-list fade-up">
          {myPosts.length === 0 ? (
            <div className="tu-empty"><div className="tu-empty-icon">👥</div><p>{tp.noTeams}</p></div>
          ) : (
            myPosts.map((p, i) => (
              <div key={i} className="profile-list-item">
                <div className="pli-dot" style={{ background: '#4A7C28' }} />
                <div className="pli-info">
                  <div className="pli-title">{p.date} · {p.timeFrom}–{p.timeTo}</div>
                  <div className="pli-meta">{p.type} · {p.applicants?.length || 0} {tp.applicants}</div>
                </div>
                <span className={`post-status-tag ${p.status}`}>{T[lang].teamUp?.statuses?.[p.status]}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, value, label, color }) {
  const bg = { gold:'var(--gold-light)', green:'var(--green-light)', blue:'#E8F0FB' }[color];
  const tc = { gold:'var(--gold-dark)',  green:'var(--green)',       blue:'#1A4A8A' }[color];
  return (
    <div className="stat-card" style={{ background: bg }}>
      <div className="sc-icon">{icon}</div>
      <div className="sc-value" style={{ color: tc }}>{value}</div>
      <div className="sc-label">{label}</div>
    </div>
  );
}
