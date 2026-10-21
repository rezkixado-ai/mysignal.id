'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../../../lib/api.js';
import Icon from '../../../components/Icon.jsx';
import '../../../styles/xignal-admin.css';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(password);
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Password salah');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lg lgx">
      <div className="lgx-bg" aria-hidden="true">
        <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="lgxg" x1="0" x2="1">
              <stop offset="0" stopColor="#4ADE80" /><stop offset=".5" stopColor="#22D3EE" /><stop offset="1" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <g fill="none" stroke="url(#lgxg)" strokeLinecap="round">
            <path d="M-40 620 C 180 520, 320 700, 520 600 S 860 380, 1240 470" strokeWidth="1.4" opacity=".35" />
            <path d="M-40 680 C 200 600, 380 760, 600 660 S 900 460, 1240 540" strokeWidth="1" opacity=".22" />
            <path d="M-40 160 C 200 240, 420 80, 640 170 S 980 330, 1240 220" strokeWidth="1.2" opacity=".28" />
            <path d="M-40 100 C 240 190, 460 30, 700 120 S 1000 260, 1240 150" strokeWidth=".9" opacity=".18" />
          </g>
          <g fill="#22D3EE">
            <circle cx="520" cy="600" r="3.5" opacity=".7" /><circle cx="640" cy="170" r="3.5" opacity=".6" />
            <circle cx="1000" cy="420" r="3" opacity=".5" /><circle cx="180" cy="515" r="3" opacity=".5" />
          </g>
        </svg>
      </div>

      <form className={`lgx-card${error ? ' shake' : ''}`} onSubmit={handleSubmit} noValidate>
        <svg className="lgx-dash" viewBox="0 0 440 560" aria-hidden="true">
          <path d="M-10 80 C 120 40, 150 200, 260 190 S 400 120, 450 300" fill="none" stroke="rgba(148,181,220,.35)" strokeWidth="1.3" strokeDasharray="5 6" strokeLinecap="round" />
        </svg>

        <img className="lgx-logo" src="/xignal-logo.png" alt="Xi:gnal" width="220" height="84" />

        <p className="lgx-eyebrow">ADMIN AREA</p>
        <h1 className="lgx-title">Masuk ke CMS<span>.</span></h1>
        <p className="lgx-sub">Masukkan password untuk mengelola konten Xignal.</p>

        <label className={`lgx-field${error ? ' bad' : ''}`} htmlFor="password">
          <span className="lgx-lab">Password</span>
          <input
            id="password" type={show ? 'text' : 'password'} value={password} placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" autoFocus required
          />
          <button type="button" className="lgx-eye" onClick={() => setShow((s) => !s)} aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}>
            <Icon name={show ? 'eyeOff' : 'eye'} size={20} />
          </button>
        </label>
        {error && <p className="lgx-err" role="alert">{error}</p>}

        <button className="lgx-btn" type="submit" disabled={loading || !password}>
          {loading ? 'Memeriksa…' : 'Masuk'}
        </button>
        <p className="lgx-foot">Falcom Technology · Xi:gnal CMS</p>
      </form>
    </div>
  );
}
