import { useState, useEffect } from 'react';
import { COURTS, TIME_SLOTS } from '../data/data';
import { getDates, getToday } from '../data/dates';
import { CLUB_INFO } from '../club';
import { getBookings } from '../lib/supabase';
import './PublicSchedulePage.css';

export default function PublicSchedulePage({ onBook, lang }) {
  const [bookings,  setBookings]  = useState([]);
  const [selDate,   setSelDate]   = useState(getToday());
  const [selCourt,  setSelCourt]  = useState(0);
  const [loading,   setLoading]   = useState(true);

  const dates = getDates(lang);

  const WEEKDAYS = {
    zh: ['周日','周一','周二','周三','周四','周五','周六'],
    en: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    de: ['So','Mo','Di','Mi','Do','Fr','Sa'],
    fr: ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'],
  };

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      const data = await getBookings();
      setBookings(data.map(b => ({
        court:  b.court,
        date:   b.date,
        time:   b.time,
        dur:    b.dur,
        people: b.people,
        member: b.profiles?.name || '会员',
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const courts = selCourt === 0 ? COURTS : COURTS.filter(c => c.id === selCourt);

  function getBooking(courtId, time) {
    const [h, m] = time.split(':').map(Number);
    const slotMins = h * 60 + m;
    return bookings.find(b => {
      if (b.court !== courtId || b.date !== selDate) return false;
      const [bh, bm] = b.time.split(':').map(Number);
      const start = bh * 60 + bm;
      const end   = start + parseFloat(b.dur) * 60;
      return slotMins >= start && slotMins < end;
    });
  }

  const surfaceLabels = {
    zh: { hard:'硬地', clay:'红土', indoor:'室内', grass:'草地' },
    en: { hard:'Hard', clay:'Clay', indoor:'Indoor', grass:'Grass' },
    de: { hard:'Hart', clay:'Sand', indoor:'Halle', grass:'Rasen' },
    fr: { hard:'Dur',  clay:'Terre', indoor:'Couvert', grass:'Gazon' },
  };
  const typeLabels = {
    zh: { outdoor:'室外', indoor:'室内' },
    en: { outdoor:'Outdoor', indoor:'Indoor' },
    de: { outdoor:'Außen', indoor:'Halle' },
    fr: { outdoor:'Ext.', indoor:'Couvert' },
  };

  const sl = surfaceLabels[lang] || surfaceLabels.zh;
  const tl = typeLabels[lang]    || typeLabels.zh;

  const labels = {
    zh: { title:'今日球场预约情况', free:'空闲 — 点击预约', booked:'已预约', bookBtn:'立即预约', all:'全部', refresh:'刷新' },
    en: { title:'Court Schedule',   free:'Available — Tap to book', booked:'Booked', bookBtn:'Book Now', all:'All', refresh:'Refresh' },
    de: { title:'Platzbelegung',     free:'Frei — Tippen zum Buchen', booked:'Belegt', bookBtn:'Jetzt buchen', all:'Alle', refresh:'Aktualisieren' },
    fr: { title:'Réservations',      free:'Libre — Appuyer pour réserver', booked:'Réservé', bookBtn:'Réserver', all:'Tous', refresh:'Actualiser' },
  }[lang] || labels?.zh;

  const L = {
    zh: { title:'今日球场预约情况', free:'空闲 — 点击预约', booked:'已预约', bookBtn:'立即预约', all:'全部', refresh:'刷新' },
    en: { title:'Court Schedule',   free:'Available', booked:'Booked', bookBtn:'Book Now', all:'All', refresh:'Refresh' },
    de: { title:'Platzbelegung',    free:'Frei',       booked:'Belegt', bookBtn:'Buchen',   all:'Alle', refresh:'Aktualisieren' },
    fr: { title:'Réservations',     free:'Libre',      booked:'Réservé', bookBtn:'Réserver', all:'Tous', refresh:'Actualiser' },
  }[lang] || { title:'Today', free:'Free', booked:'Booked', bookBtn:'Book', all:'All', refresh:'Refresh' };

  return (
    <div className="public-page">
      {/* Club header */}
      <div className="public-header">
        <div className="public-club-name">🎾 {CLUB_INFO.short}</div>
        <div className="public-title">{L.title}</div>
        <div className="public-club-hours">🕐 {CLUB_INFO.hours}</div>
      </div>

      {/* Date strip */}
      <div className="public-date-strip">
        {dates.map(d => (
          <div key={d.full}
            className={`pub-date ${selDate === d.full ? 'active' : ''}`}
            onClick={() => setSelDate(d.full)}>
            <span className="pub-date-day">{d.day || d.short}</span>
            <span className="pub-date-num">{d.num}</span>
          </div>
        ))}
      </div>

      {/* Court filter */}
      <div className="public-court-filter">
        <button className={`pub-filter ${selCourt === 0 ? 'active' : ''}`}
          onClick={() => setSelCourt(0)}>{L.all}</button>
        {COURTS.map(c => (
          <button key={c.id}
            className={`pub-filter ${selCourt === c.id ? 'active' : ''}`}
            onClick={() => setSelCourt(c.id)}>{c.name}</button>
        ))}
      </div>

      {/* Legend */}
      <div className="public-legend">
        <div className="pub-leg"><div className="pub-leg-dot taken" />已预约</div>
        <div className="pub-leg"><div className="pub-leg-dot free" />空闲可约</div>
      </div>

      {/* Schedule */}
      {loading ? (
        <div className="pub-loading">
          <div className="pub-spinner" />
          <p>加载中...</p>
        </div>
      ) : (
        <div className="public-schedule">
          {courts.map(court => (
            <div key={court.id} className="pub-court-section">
              {selCourt === 0 && (
                <div className="pub-court-title">
                  {court.name} · {sl[court.surfaceKey]} · {tl[court.typeKey]}
                </div>
              )}
              <div className="pub-slots">
                {TIME_SLOTS.map(time => {
                  const booking = getBooking(court.id, time);
                  return (
                    <div key={time}
                      className={`pub-slot ${booking ? 'taken' : 'free'}`}
                      onClick={() => !booking && onBook(court.id, time)}>
                      <span className="pub-slot-time">{time}</span>
                      {booking ? (
                        <span className="pub-slot-status taken-text">
                          👤 {booking.member} · {booking.dur}
                        </span>
                      ) : (
                        <span className="pub-slot-status free-text">{L.free}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book CTA */}
      <div className="public-cta">
        <button className="btn-gold pub-book-btn" onClick={() => onBook(null, null)}>
          🎾 {L.bookBtn}
        </button>
        <p className="pub-cta-note">{CLUB_INFO.name}</p>
      </div>
    </div>
  );
}
