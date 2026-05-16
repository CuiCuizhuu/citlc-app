import { useState } from 'react';
import { COURTS } from '../data/data';
import { T } from '../data/i18n';
import './MyBookingsPage.css';

const COURT_MAP = Object.fromEntries(COURTS.map(c => [c.id, c]));
const MONTHS = {
  zh: ['','1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
  en: ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  de: ['','Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'],
  fr: ['','Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'],
};

export default function MyBookingsPage({ bookings, userName, onCancel, lang }) {
  const t = T[lang];
  const TODAY = t.dates[0].full;
  const [confirmIdx, setConfirmIdx] = useState(null);

  const mine = bookings
    .filter(b => b.member === userName || b.isMe)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  function handleCancelConfirm() {
    onCancel(mine[confirmIdx]);
    setConfirmIdx(null);
  }

  return (
    <div className="mybookings-page">
      <div className="mb-header">
        <h2>{t.myBookingsTitle}</h2>
        <span className="mb-count">{mine.length} {t.records}</span>
      </div>

      {mine.length === 0 ? (
        <div className="mb-empty">
          <div className="mb-empty-icon">🎾</div>
          <p>{t.noBookings}</p>
          <span>{t.goBook}</span>
        </div>
      ) : (
        <div className="mb-list">
          {mine.map((b, i) => {
            const court  = COURT_MAP[b.court];
            const isPast = b.date < TODAY;
            const [dd, mm] = b.date.split('/');
            const surfLabel = t.surfaces[court?.surfaceKey] || court?.surfaceKey;
            const typeLabel = t.types[court?.typeKey] || court?.typeKey;
            const durLabel  = t.durLabels[b.dur] || b.dur;
            const modeLabel = t.modeKeys[b.modeKey] || b.mode || b.modeKey;
            return (
              <div key={i} className={`mb-item ${isPast ? 'past' : 'upcoming'}`}>
                <div className="mb-date-box">
                  <div className="mb-day">{dd}</div>
                  <div className="mb-month">{MONTHS[lang][parseInt(mm)]}</div>
                </div>
                <div className="mb-info">
                  <div className="mb-title">{court?.name} · {surfLabel} · {typeLabel}</div>
                  <div className="mb-meta">{b.time} · {durLabel} · {b.people} p. · {modeLabel}</div>
                </div>
                {isPast ? (
                  <span className="mb-badge past">{t.completed}</span>
                ) : (
                  <div className="mb-actions">
                    <span className="mb-badge upcoming">{t.upcoming}</span>
                    <button className="btn-cancel" onClick={() => setConfirmIdx(i)}>{t.cancelBook}</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {confirmIdx !== null && (
        <div className="cancel-overlay" onClick={() => setConfirmIdx(null)}>
          <div className="cancel-modal" onClick={e => e.stopPropagation()}>
            <div className="cancel-icon">⚠️</div>
            <h3>{t.confirmCancel}</h3>
            {(() => {
              const b = mine[confirmIdx];
              const court = COURT_MAP[b.court];
              return <p className="cancel-detail">{t.cancelDetail(court?.name, b.date, b.time, t.durLabels[b.dur] || b.dur)}</p>;
            })()}
            <p className="cancel-hint">{t.cancelHint}</p>
            <div className="cancel-btns">
              <button className="btn-outline" onClick={() => setConfirmIdx(null)}>{t.keepBook}</button>
              <button className="btn-cancel-confirm" onClick={handleCancelConfirm}>{t.confirmCancelBtn}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
