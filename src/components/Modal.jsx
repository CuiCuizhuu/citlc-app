import { useEffect } from 'react';
import { MEMBERS } from '../data/data';
import { T } from '../data/i18n';
import './Modal.css';

export default function Modal({ slot, onClose, onBook, lang }) {
  const t = T[lang];
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  if (!slot) return null;
  const { booking, court, date, time } = slot;
  const isFree  = !booking;
  const isMe    = booking?.isMe;
  const member  = booking ? MEMBERS[booking.member] : null;

  // Build court label from translation keys
  const COURTS_INFO = {
    1: { surfaceKey:'hard',   typeKey:'outdoor' },
    2: { surfaceKey:'clay',   typeKey:'outdoor' },
    3: { surfaceKey:'indoor', typeKey:'indoor'  },
    4: { surfaceKey:'grass',  typeKey:'indoor'  },
  };
  const ci = COURTS_INFO[court] || {};
  const courtLabel = `Court ${court} · ${t.surfaces[ci.surfaceKey] || ''} · ${t.types[ci.typeKey] || ''}`;

  const durLabel  = booking ? (t.durLabels[booking.dur] || booking.dur) : '';
  const modeLabel = booking ? (t.modeKeys[booking.modeKey] || booking.mode || '') : '';
  const levelLabel = member ? (t.levels[member.level] || member.level) : '';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box fade-up" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          {isFree ? t.freeSlotTitle : isMe ? t.myBookTitle : t.slotDetail}
        </div>
        <div className="modal-body">
          {booking && (
            <div className={`member-card ${isMe ? 'mine' : 'taken'}`}>
              <div className="mc-avatar"
                style={{ background: member?.color || '#EEE', color: member?.text || '#333' }}>
                {booking.member.slice(0, 2)}
              </div>
              <div>
                <div className="mc-name" style={{ color: isMe ? 'var(--gold-dark)' : '#7A1F1F' }}>
                  {booking.member}{isMe ? ` ${t.me}` : ''}
                </div>
                <div className="mc-level">{levelLabel}</div>
              </div>
            </div>
          )}
          <div className="detail-row"><span>{t.court}</span><span>{courtLabel}</span></div>
          <div className="detail-row"><span>{t.date}</span><span>{date}</span></div>
          <div className="detail-row"><span>{t.timeSlot}</span><span>{time}{booking ? ` · ${durLabel}` : ''}</span></div>
          {booking && <div className="detail-row"><span>{t.people}</span><span>{booking.people} p.</span></div>}
          {booking && <div className="detail-row"><span>{t.mode}</span><span>{modeLabel}</span></div>}
          {booking && !isMe && (
            <div className="detail-row"><span>{t.contact}</span><span className="phone-blur">{member?.phone || '—'}</span></div>
          )}
          {isFree && <div className="detail-row"><span>{t.status}</span><span className="free-tag">{t.freeStatus}</span></div>}
        </div>
        <div className="modal-footer">
          <button className="btn-outline" onClick={onClose}>{t.close}</button>
          {isFree && (
            <button className="btn-gold" style={{ flex:1 }} onClick={() => onBook(court, time)}>
              {t.bookThisSlot}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
