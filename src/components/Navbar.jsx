import { T } from '../data/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import './Navbar.css';

const TABS = [
  { key: 'home',       tKey: 'bookCourt'  },
  { key: 'schedule',   tKey: 'schedule'   },
  { key: 'teamup',     tKey: 'teamUpNav'  },
  { key: 'mybookings', tKey: 'myBookings' },
];

export default function Navbar({ userName, activeTab, onTabChange, onLogout, lang, onLangChange }) {
  const t = T[lang];
  const initials = userName ? userName.slice(0, 1) : '?';
  return (
    <nav className="navbar">
      <div className="nav-logo">CITLC</div>
      <div className="nav-tabs">
        {TABS.map(tab => (
          <button key={tab.key}
            className={`nav-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => onTabChange(tab.key)}>
            {t[tab.tKey] || t.teamUp?.title}
          </button>
        ))}
      </div>
      <div className="nav-user">
        <LanguageSwitcher lang={lang} onChange={onLangChange} />
        <div className="nav-avatar">{initials}</div>
        <span className="nav-name">{userName}</span>
        <button className="btn-nav-logout" onClick={onLogout}>{t.logout}</button>
      </div>
    </nav>
  );
}
