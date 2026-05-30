import { T } from '../data/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import './Navbar.css';

const TABS = [
  { key:'home',       tKey:'bookCourt',  icon:'🎾' },
  { key:'schedule',   tKey:'schedule',   icon:'📅' },
  { key:'teamup',     tKey:'teamUpNav',  icon:'👥' },
  { key:'mybookings', tKey:'myBookings', icon:'📋' },
  { key:'profile',    tKey:'profileNav', icon:'👤' },
];

export default function Navbar({ userName, activeTab, onTabChange, onLogout, lang, onLangChange }) {
  const t = T[lang];
  const initials = userName ? userName.slice(0, 1) : '?';
  return (
    <>
      {/* Desktop top navbar */}
      <nav className="navbar">
        <div className="nav-logo">CITLC</div>
        <div className="nav-tabs">
          {TABS.map(tab => (
            <button key={tab.key}
              className={`nav-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => onTabChange(tab.key)}>
              {t[tab.tKey]}
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

      {/* Mobile bottom tab bar */}
      <nav className="mobile-tabbar">
        {TABS.map(tab => (
          <button key={tab.key}
            className={`mobile-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => onTabChange(tab.key)}>
            <span className="mobile-tab-icon">{tab.icon}</span>
            <span className="mobile-tab-label">{t[tab.tKey]}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
