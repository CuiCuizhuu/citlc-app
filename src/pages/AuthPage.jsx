import { useState } from 'react';
import { T } from '../data/i18n';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './AuthPage.css';

export default function AuthPage({ onLogin, lang, onLangChange }) {
  const t = T[lang];
  const [mode, setMode]           = useState('login');
  const [loginEmail, setLoginEmail] = useState('zhang@citlc.com');
  const [loginPw,    setLoginPw]    = useState('password');
  const [regName,    setRegName]    = useState('');
  const [regEmail,   setRegEmail]   = useState('');
  const [regPhone,   setRegPhone]   = useState('');
  const [regPw,      setRegPw]      = useState('');
  const [error,      setError]      = useState('');

  function handleLogin(e) {
    e.preventDefault();
    if (!loginEmail || !loginPw) { setError(t.fillAll); return; }
    const name = loginEmail.split('@')[0].replace(/[._]/g, ' ');
    onLogin(name || t.member);
  }
  function handleRegister(e) {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone || !regPw) { setError(t.fillAll); return; }
    if (regPw.length < 8) { setError(t.pwTooShort); return; }
    onLogin(regName);
  }

  return (
    <div className="auth-layout">
      <div className="auth-hero">
        <div className="hero-pattern" />
        <CourtSVG />
        <div className="hero-text">
          <span className="hero-tag">{t.memberOnly}</span>
          <h1 className="hero-title">Crazy in Love<br />Tennis Club</h1>
          <p className="hero-sub">{t.heroSub}</p>
          <div className="hero-stats">
            <div className="hstat"><span className="hstat-n">4</span><span className="hstat-l">{t.heroCourts}</span></div>
            <div className="hstat-div" />
            <div className="hstat"><span className="hstat-n">7</span><span className="hstat-l">{t.heroDays}</span></div>
            <div className="hstat-div" />
            <div className="hstat"><span className="hstat-n">∞</span><span className="hstat-l">{t.heroFun}</span></div>
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-lang-row">
          <LanguageSwitcher lang={lang} onChange={onLangChange} light />
        </div>
        <div className="auth-card fade-up">
          {mode === 'login' ? (
            <>
              <h2>{t.welcomeBack}</h2>
              <p className="form-sub">{t.loginSub}</p>
              <form onSubmit={handleLogin}>
                <div className="field"><label>{t.email}</label>
                  <input type="email" placeholder="your@email.com"
                    value={loginEmail} onChange={e => setLoginEmail(e.target.value)} /></div>
                <div className="field"><label>{t.password}</label>
                  <input type="password" placeholder="••••••••"
                    value={loginPw} onChange={e => setLoginPw(e.target.value)} /></div>
                {error && <p className="auth-error">{error}</p>}
                <button className="btn-gold" type="submit">{t.login}</button>
              </form>
              <p className="switch-link">{t.noAccount} <span onClick={() => { setMode('register'); setError(''); }}>{t.registerNow}</span></p>
            </>
          ) : (
            <>
              <h2>{t.joinClub}</h2>
              <p className="form-sub">{t.registerSub}</p>
              <form onSubmit={handleRegister}>
                <div className="field"><label>{t.name}</label>
                  <input type="text" placeholder={t.namePlaceholder}
                    value={regName} onChange={e => setRegName(e.target.value)} /></div>
                <div className="field"><label>{t.email}</label>
                  <input type="email" placeholder="your@email.com"
                    value={regEmail} onChange={e => setRegEmail(e.target.value)} /></div>
                <div className="field"><label>{t.phone}</label>
                  <input type="tel" placeholder="138 0000 0000"
                    value={regPhone} onChange={e => setRegPhone(e.target.value)} /></div>
                <div className="field"><label>{t.passwordMin}</label>
                  <input type="password" placeholder="••••••••"
                    value={regPw} onChange={e => setRegPw(e.target.value)} /></div>
                {error && <p className="auth-error">{error}</p>}
                <button className="btn-gold" type="submit">{t.register}</button>
              </form>
              <p className="switch-link">{t.hasAccount} <span onClick={() => { setMode('login'); setError(''); }}>{t.backToLogin}</span></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CourtSVG() {
  return (
    <svg className="court-svg" viewBox="0 0 320 280" fill="none">
      <rect x="16" y="24" width="288" height="232" rx="4" stroke="#C9A96E" strokeWidth="2.5" opacity="0.6"/>
      <line x1="160" y1="24" x2="160" y2="256" stroke="#C9A96E" strokeWidth="1.5" opacity="0.5"/>
      <rect x="60" y="70" width="200" height="140" rx="2" stroke="#C9A96E" strokeWidth="1.5" opacity="0.5"/>
      <line x1="60" y1="140" x2="260" y2="140" stroke="#C9A96E" strokeWidth="1.5" opacity="0.5"/>
      <circle cx="160" cy="140" r="22" stroke="#C9A96E" strokeWidth="1.5" opacity="0.4"/>
    </svg>
  );
}
