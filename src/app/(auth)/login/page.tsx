'use client';

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useId,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import { notifyAuthChanged } from '@/lib/auth-events';
import { useAuth } from '@/providers/AuthProvider';

function apiPath(path: string) {
  const base =
    typeof window !== 'undefined'
      ? (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '/api')
      : process.env.INTERNAL_API_URL ?? 'http://localhost:3001/api';
  return `${base}${path}`;
}

function isMobileViewport() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 640px)').matches;
}

export default function LoginPage() {
  const router = useRouter();
  const { user: sessionUser, ready: authReady } = useAuth();
  const uid = useId().replace(/:/g, '');
  const [isOn, setIsOn] = useState(false);
  const isOnRef = useRef(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const lampStageRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const lampCapRef = useRef<SVGPathElement>(null);
  const lightRaysRef = useRef<SVGGElement>(null);
  const bulbRef = useRef<SVGEllipseElement>(null);

  useLayoutEffect(() => {
    const lamp = lampStageRef.current;
    const form = formRef.current;
    if (!lamp || !form) return;

    gsap.set(lamp, {
      left: '50%',
      top: '50%',
      xPercent: -50,
      yPercent: -50,
    });

    if (isMobileViewport()) {
      gsap.set(form, {
        left: '50%',
        xPercent: -50,
        bottom: '6%',
        top: 'auto',
        yPercent: 0,
        y: 120,
        opacity: 0,
        width: 'min(calc(100% - 2rem), 380px)',
      });
    } else {
      gsap.set(form, {
        right: '12%',
        left: 'auto',
        top: '50%',
        yPercent: -50,
        xPercent: 0,
        y: 0,
        x: 120,
        opacity: 0,
        width: 'min(100% - 2rem, 400px)',
      });
    }
  }, []);

  const toggleLamp = useCallback(() => {
    const next = !isOnRef.current;
    isOnRef.current = next;
    setIsOn(next);
    setMessage(null);

    const lamp = lampStageRef.current;
    const form = formRef.current;
    if (!lamp || !form) return;

    const mobile = isMobileViewport();
    const capFillOn = '#fff8e7';
    const capFillOff = `url(#cap-${uid})`;

    if (next) {
      gsap.to(document.body, {
        backgroundColor: '#1a1d22',
        duration: 0.75,
        ease: 'power2.out',
      });

      gsap.to(glowRef.current, {
        opacity: 1,
        scale: 1.15,
        duration: 0.75,
        ease: 'power2.out',
      });
      gsap.to(lampCapRef.current, {
        attr: { fill: capFillOn },
        duration: 0.45,
      });
      gsap.to(lightRaysRef.current, { opacity: 0.55, duration: 0.55 });
      gsap.to(bulbRef.current, {
        attr: { fill: '#fff6d4' },
        duration: 0.35,
      });

      if (mobile) {
        gsap.to(lamp, {
          left: '50%',
          top: '14%',
          xPercent: -50,
          yPercent: 0,
          scale: 0.92,
          duration: 1.05,
          ease: 'power3.inOut',
        });
        gsap.to(form, {
          y: 0,
          opacity: 1,
          duration: 0.85,
          delay: 0.28,
          ease: 'power3.out',
          onStart: () => {
            form.classList.add('login-auth-panel--active');
          },
        });
      } else {
        gsap.to(lamp, {
          left: '22%',
          top: '50%',
          xPercent: -50,
          yPercent: -50,
          scale: 1,
          duration: 1.1,
          ease: 'power3.inOut',
        });
        gsap.to(form, {
          x: -36,
          opacity: 1,
          duration: 0.9,
          delay: 0.32,
          ease: 'power3.out',
          onStart: () => {
            form.classList.add('login-auth-panel--active');
          },
        });
      }
    } else {
      gsap.to(document.body, {
        backgroundColor: '#121417',
        duration: 0.65,
        ease: 'power2.inOut',
      });
      gsap.to(glowRef.current, {
        opacity: 0,
        scale: 1,
        duration: 0.5,
      });
      gsap.to(lampCapRef.current, {
        attr: { fill: capFillOff },
        duration: 0.4,
      });
      gsap.to(lightRaysRef.current, { opacity: 0, duration: 0.35 });
      gsap.to(bulbRef.current, {
        attr: { fill: '#6a6a6a' },
        duration: 0.35,
      });

      if (mobile) {
        gsap.to(form, {
          y: 120,
          opacity: 0,
          duration: 0.45,
          ease: 'power2.in',
          onComplete: () =>
            form.classList.remove('login-auth-panel--active'),
        });
      } else {
        gsap.to(form, {
          x: 120,
          opacity: 0,
          duration: 0.45,
          ease: 'power2.in',
          overwrite: true,
          onComplete: () =>
            form.classList.remove('login-auth-panel--active'),
        });
      }

      gsap.to(lamp, {
        left: '50%',
        top: '50%',
        xPercent: -50,
        yPercent: -50,
        scale: 1,
        duration: 0.95,
        delay: 0.08,
        ease: 'power3.inOut',
      });
    }
  }, [uid]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !password) return;

      setLoading(true);
      setMessage(null);

      try {
        const endpoint =
          mode === 'login' ? '/auth/login' : '/auth/register';
        const res = await fetch(apiPath(endpoint), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Ошибка запроса');
        }

        localStorage.setItem('access_token', data.access_token);
        notifyAuthChanged();

        setMessage({
          text:
            mode === 'login'
              ? '✓ Успешный вход!'
              : '✓ Регистрация завершена!',
          type: 'success',
        });
        setEmail('');
        setPassword('');
        router.push('/account');
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Что-то пошло не так';
        setMessage({ text: msg, type: 'error' });
      } finally {
        setLoading(false);
      }
    },
    [email, password, mode, router],
  );

  useEffect(() => {
    document.body.style.backgroundColor = '#121417';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  useEffect(() => {
    if (authReady && sessionUser) {
      router.replace('/account');
    }
  }, [authReady, sessionUser, router]);

  return (
    <main className="login-lamp-page">
      <h1>Login Lamp</h1>

      <Link
        href="/"
        className="login-back-link absolute left-4 top-4 z-20 text-xs font-medium uppercase tracking-widest text-[var(--text-secondary)] opacity-70 transition-opacity hover:opacity-100 sm:left-6 sm:top-6"
      >
        ← На главную
      </Link>

      <div ref={lampStageRef} className="login-lamp-stage">
        <h1 className="login-brand-title">QazMarket</h1>

        <div
          className="login-lamp-container"
          onClick={toggleLamp}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleLamp();
            }
          }}
          role="button"
          tabIndex={0}
          aria-pressed={isOn}
          aria-label={
            isOn ? 'Выключить свет и скрыть форму' : 'Включить свет и открыть вход'
          }
        >
          <div ref={glowRef} className="lamp-glow lamp-glow--enhanced" />

          <svg
            className="lamp-svg lamp-svg--large"
            viewBox="0 0 200 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id={`metal-${uid}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#9a9a9a" />
                <stop offset="100%" stopColor="#3a3a3a" />
              </linearGradient>
              <linearGradient
                id={`cap-${uid}`}
                x1="40"
                y1="40"
                x2="160"
                y2="120"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#f5ead4" />
                <stop offset="45%" stopColor="#d4c4a8" />
                <stop offset="100%" stopColor="#a89878" />
              </linearGradient>
              <linearGradient
                id={`shade-${uid}`}
                x1="100"
                y1="58"
                x2="100"
                y2="118"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="rgba(255,252,240,0.95)" />
                <stop offset="100%" stopColor="rgba(200,180,140,0.4)" />
              </linearGradient>
              <linearGradient
                id={`lightGrad-${uid}`}
                x1="100"
                y1="108"
                x2="100"
                y2="240"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="rgba(255,230,170,0.45)" />
                <stop offset="55%" stopColor="rgba(255,210,120,0.12)" />
                <stop offset="100%" stopColor="rgba(255,200,100,0)" />
              </linearGradient>
              <filter
                id={`softGlow-${uid}`}
                x="-40%"
                y="-40%"
                width="180%"
                height="180%"
              >
                <feGaussianBlur stdDeviation="6" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g ref={lightRaysRef} opacity="0">
              <polygon
                points="52,108 148,108 172,240 28,240"
                fill={`url(#lightGrad-${uid})`}
              />
            </g>

            <rect
              x="88"
              y="0"
              width="24"
              height="16"
              rx="4"
              fill={`url(#metal-${uid})`}
            />
            <line
              x1="100"
              y1="16"
              x2="100"
              y2="62"
              stroke="#5c5c5c"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            <path
              ref={lampCapRef}
              d="M38 108 C38 72, 62 56, 100 56 C138 56, 162 72, 162 108 L162 118 L38 118 Z"
              fill={`url(#cap-${uid})`}
              filter={`url(#softGlow-${uid})`}
            />
            <path
              d="M48 112 C48 82, 68 66, 100 66 C132 66, 152 82, 152 112"
              fill="none"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1.2"
            />
            <ellipse
              cx="100"
              cy="118"
              rx="78"
              ry="10"
              fill={`url(#shade-${uid})`}
              opacity="0.85"
            />

            <ellipse
              ref={bulbRef}
              cx="100"
              cy="128"
              rx="16"
              ry="11"
              fill="#6a6a6a"
            />

            <rect
              x="78"
              y="118"
              width="44"
              height="6"
              rx="3"
              fill="#8a7868"
            />
          </svg>

          <div className="pull-cord pull-cord--nice" />
          <span className="lamp-hint">
            {isOn ? 'Нажми, чтобы выключить' : 'Потяни за шнурок'}
          </span>
        </div>
      </div>

      <div ref={formRef} className="login-auth-panel">
        <div className="auth-form login-auth-glass">
          <p className="login-auth-welcome mb-4 text-center text-sm text-[var(--text-secondary)]">
            Добро пожаловать
          </p>
          <div className="auth-tabs">
            <button
              type="button"
              className={cn('auth-tab', mode === 'login' && 'active')}
              onClick={(e) => {
                e.stopPropagation();
                setMode('login');
                setMessage(null);
              }}
            >
              Вход
            </button>
            <button
              type="button"
              className={cn('auth-tab', mode === 'register' && 'active')}
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
