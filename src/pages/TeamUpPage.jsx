import { useState } from 'react';
import { T } from '../data/i18n';
import { MEMBERS } from '../data/data';
import './TeamUpPage.css';

const TYPE_KEYS = ['singles', 'doubles'];

export default function TeamUpPage({ posts, chats, userName, lang, onAddPost, onApply, onSendMsg, onBookCourt }) {
  const t = T[lang];
  const tu = t.teamUp;

  const [view, setView] = useState('board');   // board | myposts | inbox | newpost | chat
  const [chatWith, setChatWith] = useState(null);  // { chatId, otherUser, postId }
  const [newMsg, setNewMsg] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);

  // New post form state
  const [npDate,     setNpDate]     = useState('05/03');
  const [npFrom,     setNpFrom]     = useState('09:00');
  const [npTo,       setNpTo]       = useState('11:00');
  const [npType,     setNpType]     = useState('singles');
  const [npNote,     setNpNote]     = useState('');

  const myPosts     = posts.filter(p => p.author === userName);
  const otherPosts  = posts.filter(p => p.author !== userName && p.status === 'open');
  const myChats     = chats.filter(c => c.participants.includes(userName));

  // Unread count: chats where last message is not from me
  const unreadCount = myChats.filter(c => {
    const last = c.messages[c.messages.length - 1];
    return last && last.from !== userName;
  }).length;

  function handleNewPost() {
    if (!npNote.trim()) return;
    onAddPost({
      id: 'p' + Date.now(),
      author: userName,
      date: npDate,
      timeFrom: npFrom,
      timeTo: npTo,
      level: 'regular',
      type: npType,
      note: npNote,
      status: 'open',
      applicants: [],
    });
    setShowNewPost(false);
    setNpNote('');
    setView('board');
  }

  function openChat(otherUser, postId) {
    // find existing chat or create new
    const existing = chats.find(c =>
      c.participants.includes(userName) && c.participants.includes(otherUser)
    );
    const chatId = existing ? existing.id : null;
    setChatWith({ chatId, otherUser, postId });
    setView('chat');
  }

  function handleSend() {
    if (!newMsg.trim()) return;
    onSendMsg(chatWith, newMsg.trim(), userName);
    setNewMsg('');
  }

  const DATES_MAP = Object.fromEntries((t.dates || []).map(d => [d.full, (d.day || d.short) + ' ' + d.num]));
  const TIMES = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];

  const currentChat = chatWith?.chatId ? chats.find(c => c.id === chatWith.chatId) : null;
  const chatMessages = currentChat ? currentChat.messages
    : chats.find(c => c.participants.includes(userName) && c.participants.includes(chatWith?.otherUser))?.messages || [];

  return (
    <div className="teamup-page">
      {/* Top bar */}
      <div className="tu-header">
        <h2>{tu.title}</h2>
        <div className="tu-tabs">
          <button className={`tu-tab ${view === 'board' ? 'on' : ''}`} onClick={() => setView('board')}>{tu.board}</button>
          <button className={`tu-tab ${view === 'myposts' ? 'on' : ''}`} onClick={() => setView('myposts')}>{tu.myPosts}</button>
          <button className={`tu-tab ${view === 'inbox' ? 'on' : ''}`} onClick={() => setView('inbox')}>
            {tu.inbox}{unreadCount > 0 && <span className="tu-badge">{unreadCount}</span>}
          </button>
        </div>
        <button className="btn-post-new" onClick={() => setShowNewPost(true)}>+ {tu.postAvail}</button>
      </div>

      {/* ── BOARD ── */}
      {view === 'board' && (
        <div className="tu-body fade-up">
          {otherPosts.length === 0 ? (
            <div className="tu-empty">
              <div className="tu-empty-icon">🎾</div>
              <p>{tu.noPosts}</p>
              <span>{tu.beFirst}</span>
            </div>
          ) : (
            otherPosts.map(post => (
              <PostCard key={post.id} post={post} tu={tu} lang={lang} datesMap={DATES_MAP}
                onChat={() => openChat(post.author, post.id)}
                onApply={() => { onApply(post.id, userName); openChat(post.author, post.id); }}
              />
            ))
          )}
        </div>
      )}

      {/* ── MY POSTS ── */}
      {view === 'myposts' && (
        <div className="tu-body fade-up">
          {myPosts.length === 0 ? (
            <div className="tu-empty">
              <div className="tu-empty-icon">📋</div>
              <p>{tu.noMyPosts}</p>
              <span>{tu.postToFind}</span>
            </div>
          ) : (
            myPosts.map(post => (
              <PostCard key={post.id} post={post} tu={tu} lang={lang} datesMap={DATES_MAP}
                isMine
                applicants={post.applicants}
                onChatApplicant={user => openChat(user, post.id)}
                onBookCourt={() => onBookCourt(post)}
              />
            ))
          )}
        </div>
      )}

      {/* ── INBOX ── */}
      {view === 'inbox' && (
        <div className="tu-body fade-up">
          {myChats.length === 0 ? (
            <div className="tu-empty">
              <div className="tu-empty-icon">💬</div>
              <p>{tu.noChats}</p>
            </div>
          ) : (
            myChats.map(chat => {
              const other = chat.participants.find(p => p !== userName);
              const last  = chat.messages[chat.messages.length - 1];
              const unread = last && last.from !== userName;
              return (
                <div key={chat.id} className={`chat-preview ${unread ? 'unread' : ''}`}
                  onClick={() => { setChatWith({ chatId: chat.id, otherUser: other, postId: chat.postId }); setView('chat'); }}>
                  <div className="cp-av" style={{ background: MEMBERS[other]?.color || '#E8E4D8', color: MEMBERS[other]?.text || '#555' }}>
                    {other.slice(0, 2)}
                  </div>
                  <div className="cp-info">
                    <div className="cp-name">{other}{unread && <span className="cp-dot" />}</div>
                    <div className="cp-last">{last?.text || '—'}</div>
                  </div>
                  <div className="cp-time">{last?.time || ''}</div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── CHAT ── */}
      {view === 'chat' && chatWith && (
        <div className="chat-wrap fade-up">
          <div className="chat-topbar">
            <button className="back-btn" onClick={() => setView('inbox')}>←</button>
            <div className="chat-av" style={{ background: MEMBERS[chatWith.otherUser]?.color || '#E8E4D8', color: MEMBERS[chatWith.otherUser]?.text || '#555' }}>
              {chatWith.otherUser.slice(0, 2)}
            </div>
            <div>
              <div className="chat-peer">{chatWith.otherUser}</div>
              <div className="chat-peer-level">{MEMBERS[chatWith.otherUser]?.level || ''}</div>
            </div>
            {chatWith.postId && (
              <button className="btn-book-from-chat" onClick={() => {
                const post = posts.find(p => p.id === chatWith.postId);
                if (post) onBookCourt(post);
              }}>🎾 {tu.bookNow}</button>
            )}
          </div>

          <div className="chat-messages" id="chat-msgs">
            {chatMessages.length === 0 && (
              <div className="chat-intro">{tu.chatIntro(chatWith.otherUser)}</div>
            )}
            {chatMessages.map((msg, i) => {
              const isMe = msg.from === userName;
              return (
                <div key={i} className={`msg-row ${isMe ? 'me' : 'them'}`}>
                  {!isMe && (
                    <div className="msg-av" style={{ background: MEMBERS[msg.from]?.color || '#E8E4D8', color: MEMBERS[msg.from]?.text || '#555' }}>
                      {msg.from.slice(0, 2)}
                    </div>
                  )}
                  <div className="msg-bubble">
                    <div className="msg-text">{msg.text}</div>
                    <div className="msg-time">{msg.time}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="chat-input-row">
            <input className="chat-input" placeholder={tu.msgPlaceholder}
              value={newMsg} onChange={e => setNewMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()} />
            <button className="btn-send" onClick={handleSend}>{tu.send}</button>
          </div>
        </div>
      )}

      {/* ── NEW POST MODAL ── */}
      {showNewPost && (
        <div className="modal-overlay" onClick={() => setShowNewPost(false)}>
          <div className="modal-box fade-up" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">{tu.postAvail}</div>
            <div className="modal-body">
              <div className="field-group">
                <div className="field-label">{tu.availDate}</div>
                <div className="pill-row" style={{ flexWrap:'wrap' }}>
                  {(t.dates || []).map(d => (
                    <button key={d.full} className={`pill ${npDate === d.full ? 'active' : ''}`}
                      onClick={() => setNpDate(d.full)}>{d.day || d.short} {d.num}</button>
                  ))}
                </div>
              </div>
              <div className="field-group">
                <div className="field-label">{tu.availTime}</div>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <select className="tu-select" value={npFrom} onChange={e => setNpFrom(e.target.value)}>
                    {TIMES.map(t2 => <option key={t2} value={t2}>{t2}</option>)}
                  </select>
                  <span style={{ color:'var(--ink-soft)' }}>—</span>
                  <select className="tu-select" value={npTo} onChange={e => setNpTo(e.target.value)}>
                    {TIMES.map(t2 => <option key={t2} value={t2}>{t2}</option>)}
                  </select>
                </div>
              </div>
              <div className="field-group">
                <div className="field-label">{tu.gameType}</div>
                <div className="pill-row">
                  {TYPE_KEYS.map(k => (
                    <button key={k} className={`pill ${npType === k ? 'active' : ''}`}
                      onClick={() => setNpType(k)}>{tu.types[k]}</button>
                  ))}
                </div>
              </div>
              <div className="field-group">
                <div className="field-label">{tu.noteLabel}</div>
                <textarea className="tu-textarea" placeholder={tu.notePlaceholder}
                  value={npNote} onChange={e => setNpNote(e.target.value)} rows={3} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowNewPost(false)}>{t.close}</button>
              <button className="btn-gold" style={{ flex:1 }} onClick={handleNewPost}>{tu.publish}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PostCard({ post, tu, lang, datesMap, isMine, onChat, onApply, applicants, onChatApplicant, onBookCourt }) {
  const levelColors = { diamond:'#C9A96E', senior:'#4A7C28', regular:'#4A6A9E' };
  const member = MEMBERS[post.author];
  const dateLabel = datesMap[post.date] || post.date;
  return (
    <div className={`post-card ${isMine ? 'mine' : ''}`}>
      <div className="post-top">
        <div className="post-author">
          <div className="post-av" style={{ background: member?.color || '#E8E4D8', color: member?.text || '#555' }}>
            {post.author.slice(0, 2)}
          </div>
          <div>
            <div className="post-name">{post.author}</div>
            <div className="post-level" style={{ color: levelColors[post.level] || '#888' }}>
              {tu.levels[post.level]}
            </div>
          </div>
        </div>
        <div className="post-tags">
          <span className={`post-type-tag ${post.type}`}>{tu.types[post.type]}</span>
          <span className={`post-status-tag ${post.status}`}>{tu.statuses[post.status]}</span>
        </div>
      </div>

      <div className="post-info-row">
        <span className="post-info-item">📅 {dateLabel}</span>
        <span className="post-info-item">🕐 {post.timeFrom} – {post.timeTo}</span>
      </div>

      {post.note && <div className="post-note">"{post.note}"</div>}

      {!isMine && post.status === 'open' && (
        <div className="post-actions">
          <button className="btn-chat-apply" onClick={onChat}>💬 {tu.chatFirst}</button>
          <button className="btn-apply" onClick={onApply}>✋ {tu.apply}</button>
        </div>
      )}

      {isMine && (
        <div className="post-mine-section">
          {applicants && applicants.length > 0 ? (
            <>
              <div className="field-label" style={{ marginBottom:8 }}>{tu.applicants} ({applicants.length})</div>
              {applicants.map((a, i) => (
                <div key={i} className="applicant-row">
                  <div className="post-av sm" style={{ background: MEMBERS[a]?.color || '#E8E4D8', color: MEMBERS[a]?.text || '#555' }}>
                    {a.slice(0, 2)}
                  </div>
                  <span className="applicant-name">{a}</span>
                  <button className="btn-chat-apply" onClick={() => onChatApplicant(a)}>💬 {tu.chat}</button>
                  <button className="btn-apply" onClick={onBookCourt}>🎾 {tu.bookTogether}</button>
                </div>
              ))}
            </>
          ) : (
            <p className="post-waiting">{tu.waitingApplicants}</p>
          )}
        </div>
      )}
    </div>
  );
}
