import { useState } from 'react';
import { LANGUAGES } from '../data/i18n';
import './LanguageSwitcher.css';

export default function LanguageSwitcher({ lang, onChange }) {
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find(l => l.code === lang);

  return (
    <div className="lang-switcher">
      <button className="lang-btn" onClick={() => setOpen(o => !o)}>
        <span className="lang-flag">{current.flag}</span>
        <span className="lang-label">{current.label}</span>
        <span className={`lang-arrow ${open ? 'up' : ''}`}>▾</span>
      </button>

      {open && (
        <>
          <div className="lang-backdrop" onClick={() => setOpen(false)} />
          <div className="lang-dropdown">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                className={`lang-option ${lang === l.code ? 'active' : ''}`}
                onClick={() => { onChange(l.code); setOpen(false); }}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
                {lang === l.code && <span className="lang-check">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
