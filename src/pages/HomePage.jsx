import { COURTS, TIME_SLOTS } from '../data/data';
import { T } from '../data/i18n';
import { getDates, getToday } from '../data/dates';
import './HomePage.css';

const SURFACE_CLS = { hard:'hard', clay:'clay', indoor:'indoor', grass:'grass' };

export default function HomePage({ bookings, onSelectCourt, lang }) {
  const t = T[lang];
  const today = getToday();

  function getCourtStats(courtId) {
    const takenSlots = TIME_SLOTS.filter(slot => {
      const [sh, sm] = slot.split(':').map(Number);
      const slotMins = sh * 60 + sm;
      return bookings.some(b => {
        if (b.court !== courtId || b.date !== today) return false;
        const [bh, bm] = b.time.split(':').map(Number);
        const start = bh * 60 + bm;
        const end   = start + parseFloat(b.dur) * 60;
        return slotMins >= start && slotMins < end;
      });
    });
    const free = TIME_SLOTS.length - takenSlots.length;
    const pct  = Math.round((takenSlots.length / TIME_SLOTS.length) * 100);
    return { free, pct };
  }

  const totalFree = COURTS.reduce((acc, c) => acc + getCourtStats(c.id).free, 0);
  const locale = { zh:'zh-CN', en:'en-GB', de:'de-DE', fr:'fr-FR' }[lang] || 'en-GB';
  const dateStr = new Date().toLocaleDateString(locale, { year:'numeric', month:'long', day:'numeric', weekday:'long' });

  return (
    <div className="home-page fade-up">
      <div className="home-header">
        <div>
          <p className="home-date">{dateStr}</p>
          <h2 className="home-title">{t.whichCourt}</h2>
        </div>
        <div className="home-stats">
          <div className="stat"><span className="stat-n">4</span><span className="stat-l">{t.courts}</span></div>
          <div className="stat-div" />
          <div className="stat"><span className="stat-n">{totalFree}</span><span className="stat-l">{t.freeSlots}</span></div>
        </div>
      </div>

      <div className="court-grid">
        {COURTS.map(court => {
          const { free, pct } = getCourtStats(court.id);
          const unavailable = free === 0;
          const surfLabel = t.surfaces[court.surfaceKey];
          const typeLabel = t.types[court.typeKey];
          return (
            <div key={court.id}
              className={`court-card ${unavailable ? 'full' : ''}`}
              onClick={() => !unavailable && onSelectCourt(court)}>
              <div className="court-card-top">
                <span className="court-num">{court.name}</span>
                <span className={`surface-tag ${SURFACE_CLS[court.surfaceKey]}`}>{surfLabel} · {typeLabel}</span>
              </div>
              <div className="court-avail-bar">
                <div className="court-avail-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="court-avail-row">
                {unavailable
                  ? <span className="avail-full">{t.courtFull}</span>
                  : <span className="avail-free">✓ {free} {t.slotsAvail}</span>
                }
                <span className="avail-pct">{pct}{t.booked}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
