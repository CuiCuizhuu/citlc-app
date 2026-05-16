import { useState } from 'react';
import { COURTS, TIME_SLOTS } from '../data/data';
import { T } from '../data/i18n';
import Modal from '../components/Modal';
import './SchedulePage.css';

export default function SchedulePage({ bookings, userName, onBook, lang }) {
  const t = T[lang];
  const DATES = t.dates;
  const [selDate,  setSelDate]  = useState(DATES[0].full);
  const [selCourt, setSelCourt] = useState(0);
  const [modal,    setModal]    = useState(null);

  const courts = selCourt === 0 ? COURTS : COURTS.filter(c => c.id === selCourt);

  function getBooking(courtId, time) {
    const [h, m] = time.split(':').map(Number);
    const slotMins = h * 60 + m;
    const b = bookings.find(b => {
      if (b.court !== courtId || b.date !== selDate) return false;
      const [bh, bm] = b.time.split(':').map(Number);
      const start = bh * 60 + bm;
      const end   = start + parseFloat(b.dur) * 60;
      return slotMins >= start && slotMins < end;
    });
    if (!b) return null;
    return { ...b, isMe: b.member === userName };
  }

  function openModal(courtId, time) {
    setModal({ booking: getBooking(courtId, time), court: courtId, date: selDate, time });
  }
  function handleBook(courtId, time) { setModal(null); onBook(courtId, time); }

  return (
    <div className="schedule-page">
      <div className="sched-header">
        <h2>{t.courtSchedule}</h2>
        <div className="court-filter">
          <button className={`filter-btn ${selCourt === 0 ? 'active' : ''}`}
            onClick={() => setSelCourt(0)}>{t.all}</button>
          {COURTS.map(c => (
            <button key={c.id}
              className={`filter-btn ${selCourt === c.id ? 'active' : ''}`}
              onClick={() => setSelCourt(c.id)}>{c.name}</button>
          ))}
        </div>
      </div>

      <div className="date-strip">
        {DATES.map(d => (
          <div key={d.full} className={`date-item ${selDate === d.full ? 'active' : ''}`}
            onClick={() => setSelDate(d.full)}>
            <span className="di-day">{d.day || d.short}</span>
            <span className="di-num">{d.num}</span>
          </div>
        ))}
      </div>

      <div className="legend-row">
        <div className="leg"><div className="leg-dot mine" />{t.myBookingLeg}</div>
        <div className="leg"><div className="leg-dot taken" />{t.takenLeg}</div>
        <div className="leg"><div className="leg-dot free" />{t.freeLeg}</div>
      </div>

      <div className="sched-body">
        {courts.map(court => {
          const surfLabel = t.surfaces[court.surfaceKey];
          const typeLabel = t.types[court.typeKey];
          return (
            <div key={court.id} className="court-section">
              {selCourt === 0 && (
                <div className="court-section-title">
                  {court.name} · {surfLabel} · {typeLabel}
                </div>
              )}
              {TIME_SLOTS.map(time => {
                const booking = getBooking(court.id, time);
                const isMe    = booking?.isMe;
                const cellCls = !booking ? 'free' : isMe ? 'mine' : 'taken';
                const modeLabel = booking ? (t.modeKeys[booking.modeKey] || booking.mode || booking.modeKey) : '';
                const durLabel  = booking ? (t.durLabels[booking.dur] || booking.dur) : '';
                return (
                  <div key={time} className="slot-row">
                    <div className="slot-time">{time}</div>
                    <div className={`slot-cell ${cellCls}`} onClick={() => openModal(court.id, time)}>
                      {!booking ? (
                        <div className="slot-free-inner">{t.free}</div>
                      ) : (
                        <div className="slot-inner">
                          <div className="slot-member-row">
                            <div className={`slot-av ${isMe ? 'av-mine' : 'av-taken'}`}>
                              {booking.member.slice(0, 2)}
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div className={`slot-name ${isMe ? 'name-mine' : 'name-taken'}`}>
                                {booking.member}{isMe ? ` ${t.me}` : ''}
                              </div>
                              <div className="slot-meta">
                                {booking.people} p. · {modeLabel} · {durLabel}
                              </div>
                            </div>
                            <span className={`slot-badge ${isMe ? 'badge-mine' : 'badge-taken'}`}>
                              {isMe ? t.myBookingBadge : t.takenBadge}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {modal && <Modal slot={modal} onClose={() => setModal(null)} onBook={handleBook} lang={lang} />}
    </div>
  );
}
