'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import gsap from 'gsap';

const API_URL = 'http://localhost:3001/api';

export default function Home() {
  const [isOn, setIsOn] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const glowRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const lampCapRef = useRef<SVGPathElement>(null);
  const lightRaysRef = useRef<SVGGElement>(null);

  // Переключение лампы
  const toggleLamp = useCallback(() => {
    const next = !isOn;
    setIsOn(next);
    setMessage(null);

    if (next) {
      // ВКЛЮЧИТЬ
      gsap.to(document.body, {
        backgroundColor: '#1c1f24',
        duration: 0.6,
        ease: 'power2.out',
      });
      gsap.to(glowRef.current, {
        opacity: 1,
        scale: 1.1,
        duration: 0.6,
        ease: 'power2.out',
      });
      gsap.to(lampCapRef.current, { fill: '#fff8e7', duration: 0.4 });
      gsap.to(lightRaysRef.current, { opacity: 0.6, duration: 0.5 });
      gsap.to(formRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        delay: 0.2,
        ease: 'power3.out',
        onStart: () => formRef.current?.classList.add('active'),
      });
    } else {
      // ВЫКЛЮЧИТЬ
      gsap.to(document.body, {
        backgroundColor: '#121417',
        duration: 0.6,
        ease: 'power2.out',
      });
      gsap.to(glowRef.current, {
        opacity: 0,
        scale: 1,
        duration: 0.5,
      });
      gsap.to(lampCapRef.current, { fill: '#e8dcc8', duration: 0.4 });
      gsap.to(lightRaysRef.current, { opacity: 0, duration: 0.3 });
      gsap.to(formRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => formRef.current?.classList.remove('active'),
      });
    }
  }, [isOn]);

  // Отправка формы
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !password) return;

      setLoading(true);
      setMessage(null);

      try {
        const endpoint =
          mode === 'login' ? '/auth/login' : '/auth/register';
        const res = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Ошибка запроса');
        }

        localStorage.setItem('access_token', data.access_token);

        setMessage({
          text:
            mode === 'login'
              ? '✓ Успешный вход!'
              : '✓ Регистрация завершена!',
          type: 'success',
        });
        setEmail('');
        setPassword('');
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Что-то пошло не так';
        setMessage({ text: msg, type: 'error' });
      } finally {
        setLoading(false);
      }
    },
    [email, password, mode],
  );

  useEffect(() => {
    document.body.style.backgroundColor = '#121417';
  }, []);

  return (
    <main className="login-lamp-page">
      <h1>Login Lamp</h1>

      {/* ── Лампа ── */}
      <div className="lamp-container" onClick={toggleLamp}>
        <div ref={glowRef} className="lamp-glow" />

        <svg
          className="lamp-svg"
          viewBox="0 0 160 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Лучи света */}
          <g ref={lightRaysRef} opacity="0">
            <polygon
              points="40,95 120,95 140,200 20,200"
              fill="url(#lightGrad)"
            />
            <defs>
              <linearGradient
                id="lightGrad"
                x1="80"
                y1="95"
                x2="80"
                y2="200"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="rgba(255,220,150,0.3)" />
                <stop offset="100%" stopColor="rgba(255,220,150,0)" />
              </linearGradient>
            </defs>
          </g>

          {/* Крепление */}
          <rect x="72" y="0" width="16" height="12" rx="3" fill="#666" />
          {/* Провод */}
          <line x1="80" y1="12" x2="80" y2="55" stroke="#555" strokeWidth="2" />

          {/* Шляпка лампы */}
          <path
            ref={lampCapRef}
            d="M30 85 C30 60, 50 50, 80 50 C110 50, 130 60, 130 85 L130 95 L30 95 Z"
            fill="#e8dcc8"
          />
          <path
            d="M35 90 C35 70, 52 58, 80 58 C108 58, 125 70, 125 90"
            fill="none"
            stroke="#c9bda6"
            strokeWidth="1"
            opacity="0.5"
          />

          {/* Лампочка */}
          <ellipse
            cx="80"
            cy="100"
            rx="12"
            ry="8"
            fill={isOn ? '#fff3d4' : '#888'}
          />

          {/* Основание */}
          <rect x="65" y="93" width="30" height="4" rx="2" fill="#a09080" />
        </svg>

        <div className="pull-cord" />
        <span className="lamp-hint">потяни за шнурок</span>
      </div>

      {/* ── Форма авторизации ── */}
      <div ref={formRef} className="auth-form-wrapper">
        <div className="auth-form">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setMode('login');
                setMessage(null);
              }}
            >
              Вход
            </button>
            <button
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setMode('register');
                setMessage(null);
              }}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
            <div className="form-group">
              <input
                id="email-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <input
                id="password-input"
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={
                  mode === 'register' ? 'new-password' : 'current-password'
                }
                minLength={6}
              />
            </div>
            <button
              id="submit-btn"
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading
                ? '...'
                : mode === 'login'
                  ? 'Войти'
                  : 'Зарегистрироваться'}
            </button>
          </form>

          {message && (
            <div className={`auth-message ${message.type}`}>{message.text}</div>
          )}
        </div>
      </div>
    </main>
  );
}
