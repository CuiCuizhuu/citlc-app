import { useState } from 'react';
import { TIME_SLOTS } from '../data/data';
import { T } from '../data/i18n';
import { getDates } from '../data/dates';
import './BookingPage.css';

const DURATIONS = ['1h', '2h'];
const MODE_KEYS = ['casual', 'training', 'match'];

export default function BookingPage({ court, bookings, userName, onBack, onConfirm, lang }) {
  const t = T[lang];
  const DATES = getDates(lang);

  const [step,    setStep]   = useState(1);
  const [date,    setDate]   = useState(DATES[0].full);
  const [time,    setTime]   = useState('');
  const [dur,     setDur]    = useState('1h');
  const [people,  setPeople] = useState(2);
  const [modeKey, setModeKey] = useState('casual');
  const [done,    setDone]   = useState(false);
  const [confId,  setConfId] = useState('');

  function isSlotTaken(slot) {
    const [sh, sm] = slot.split(':').map(Number);
    const slotMins = sh * 60 + sm;
    return bookings.some(b => {
      if (b.court !== court.id || b.date !== date) return false;
      const [bh, bm] = b.time.split(':').map(Number);
      const start = bh * 60 + bm;
      const end   = start + parseFloat(b.dur) * 60;
      return slotMins >= start && slotMins < end;
    });
  }

  function canBook(slot) {
    const [sh, sm] = slot.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const durMins   = parseFloat(dur) * 60;
    for (let t2 = startMins; t2 < startMins + durMins; t2 += 60) {
      const hh = String(Math.floor(t2 / 60)).padStart(2, '0');
      const mm = String(t2 % 60).padStart(2, '0');
      if (isSlotTaken(`${hh}:${mm}`)) return false;
    }
    const last = TIME_SLOTS[TIME_SLOTS.length - 1];
    const [lh, lm] = last.split(':').map(Number);
    if (startMins + durMins > lh * 60 + lm + 60) return false;
    return true;
  }

  const takenTimes       = TIME_SLOTS.filter(isSlotTaken);
  const insufficientTimes = TIME_SLOTS.filter(s => !isSlotTaken(s) && !canBook(s));

  function handleConfirm() {
    const id = Math.floor(Math.random() * 9000 + 1000);
    setConfId(id);
    onConfirm({ court: court.id, date, time, dur, people, modeKey, mode: t.modeKeys[modeKey], member: userName, isMe: true });
    setDone(true);
  }

  const surfLabel = t.surfaces[court.surfaceKey];
  const typeLabel = t.types[court.typeKey];
  const durLabel  = t.durLabels[dur] || dur;
  const modeLabel = t.modeKeys[modeKey];

  if (done) {
    return (
      <div className="booking-container fade-up">
        <div className="success-wrap">
          <div className="success-icon">✓</div>
          <h3>{t.bookSuccess}</h3>
          <p>{t.arriveOnTime}</p>
          <div className="confirm-card">
            <div className="conf-num">{t.bookingId} #CITLC-{confId}</div>
            <Row label={t.court}    value={`${court.name} · ${surfLabel} · ${typeLabel}`} />
            <Row label={t.date}     value={date} />
            <Row label={t.timeSlot} value={`${time} · ${durLabel}`} />
            <Row label={t.people}   value={`${people} p. · ${t.peopleNotes[people]}`} />
            <Row label={t.mode}     value={modeLabel} />
            <Row label={t.member}   value={userName} />
          </div>
          <button className="btn-gold success-btn" onClick={onBack}>{t.backHome}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-container fade-up">
      <button className="back-btn" onClick={() => { if (step === 1) onBack(); else setStep(s => s - 1); }}>
        ← {step === 1 ? t.back : t.prevStep}
      </button>
      <h2>{court.name} — {surfLabel} · {typeLabel}</h2>

      <div className="steps">
        <StepDot n={1} label={t.selectDate.split(' ')[0]}   current={step} />
        <StepLine done={step > 1} />
        <StepDot n={2} label={t.choosePeople.split(' ')[0]} current={step} />
        <StepLine done={step > 2} />
        <StepDot n={3} label={t.confirmBook.split(' ')[0]}  current={step} />
      </div>

      {step === 1 && (
        <div className="bstep fade-up">
          <div className="field-group">
            <div className="field-label">{t.selectDate}</div>
            <div className="pill-row">
              {DATES.map(d => (
                <button key={d.full} className={`pill ${date === d.full ? 'active' : ''}`}
                  onClick={() => { setDate(d.full); setTime(''); }}>
                  {d.day || d.short} {d.num}
                </button>
              ))}
            </div>
          </div>

          <div className="field-group">
            <div className="field-label">{t.selectTime}</div>
            <div className="time-grid">
              {TIME_SLOTS.map(ts => {
                const taken = takenTimes.includes(ts);
                const insuf = insufficientTimes.includes(ts);
                const cls   = taken ? 'taken' : insuf ? 'insufficient' : time === ts ? 'active' : '';
                return (
                  <button key={ts} className={`time-slot ${cls}`}
                    disabled={taken || insuf} onClick={() => setTime(ts)}>{ts}</button>
                );
              })}
            </div>
            <div className="slot-legend">
              {takenTimes.length > 0       && <span className="legend-taken">{t.legendTaken}</span>}
              {insufficientTimes.length > 0 && <span className="legend-insuf">{t.legendInsuf} {durLabel}</span>}
            </div>
          </div>

          <div className="field-group">
            <div className="field-label">{t.duration}</div>
            <div className="pill-row">
              {DURATIONS.map(d => (
                <button key={d} className={`pill ${dur === d ? 'active' : ''}`}
                  onClick={() => { setDur(d); setTime(''); }}>
                  {t.durLabels[d]}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-gold" disabled={!time} style={{ opacity: time ? 1 : 0.45 }}
            onClick={() => setStep(2)}>{t.nextStep}</button>
        </div>
      )}

      {step === 2 && (
        <div className="bstep fade-up">
          <div className="field-group">
            <div className="field-label">{t.choosePeople}</div>
            <div className="people-sel">
              <button className="ppl-btn" onClick={() => setPeople(p => Math.max(1, p - 1))}>−</button>
              <span className="ppl-num">{people}</span>
              <button className="ppl-btn" onClick={() => setPeople(p => Math.min(4, p + 1))}>+</button>
            </div>
            <p className="ppl-note">{t.peopleNotes[people]}</p>
          </div>
          <div className="field-group">
            <div className="field-label">{t.gameMode}</div>
            <div className="pill-row">
              {MODE_KEYS.map(k => (
                <button key={k} className={`pill ${modeKey === k ? 'active' : ''}`}
                  onClick={() => setModeKey(k)}>{t.modeKeys[k]}</button>
              ))}
            </div>
          </div>
          <button className="btn-gold" onClick={() => setStep(3)}>{t.nextStep}</button>
        </div>
      )}

      {step === 3 && (
        <div className="bstep fade-up">
          <div className="field-label" style={{ marginBottom: 14 }}>{t.confirmInfo}</div>
          <div className="confirm-card">
            <Row label={t.court}    value={`${court.name} · ${surfLabel} · ${typeLabel}`} />
            <Row label={t.date}     value={date} />
            <Row label={t.timeSlot} value={`${time} · ${durLabel}`} />
            <Row label={t.people}   value={`${people} p. · ${t.peopleNotes[people]}`} />
            <Row label={t.mode}     value={modeLabel} />
            <Row label={t.member}   value={userName} />
          </div>
          <button className="btn-gold" onClick={handleConfirm}>{t.confirmBook}</button>
        </div>
      )}
    </div>
  );
}

function StepDot({ n, label, current }) {
  const done = current > n; const active = current === n;
  return (
    <div className="step-item">
      <div className={`step-dot ${done ? 'done' : active ? 'active' : ''}`}>{done ? '✓' : n}</div>
      <div className={`step-lbl ${active || done ? 'hi' : ''}`}>{label}</div>
    </div>
  );
}
function StepLine({ done }) { return <div className={`step-line ${done ? 'done' : ''}`} />; }
function Row({ label, value }) {
  return <div className="confirm-row"><span>{label}</span><span>{value}</span></div>;
}
