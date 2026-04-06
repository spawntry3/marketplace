'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  Sparkles,
  User,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { cn } from '@/lib/utils';

function formatJoined(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

const tileClass =
  'flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-[box-shadow,transform] hover:shadow-md hover:shadow-[var(--color-ink)]/[0.06] active:scale-[0.99]';

export default function AccountPage() {
  const router = useRouter();
  const { user, ready, logout } = useAuth();

  useEffect(() => {
    if (ready && !user) {
      router.replace('/login');
    }
  }, [ready, user, router]);

  if (!ready) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-[var(--color-border)]/70" />
        <div className="mt-8 h-40 animate-pulse rounded-[2rem] bg-[var(--color-border)]/50" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-sm text-[var(--color-muted)]">
        Перенаправляем на страницу входа…
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
      <nav
        className="mb-8 flex flex-wrap items-center gap-1 text-sm text-[var(--color-muted)]"
        aria-label="Хлебные крошки"
      >
        <Link href="/" className="hover:text-[var(--color-primary)]">
          Главная
        </Link>
        <span className="opacity-50">/</span>
        <span className="text-[var(--color-ink)]">Личный кабинет</span>
      </nav>

      <div className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg shadow-[var(--color-ink)]/[0.04] md:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-12 h-40 w-40 rounded-full bg-[var(--color-primary)]/10 blur-2xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-teal-600 text-white shadow-lg shadow-teal-900/15">
              <User size={28} strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-[var(--color-ink)] md:text-2xl">
                Личный кабинет
              </h1>
              <p className="mt-1 break-all text-sm text-[var(--color-muted)]">
                {user.email}
              </p>
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                На сайте с {formatJoined(user.createdAt)} · роль:{' '}
                <span className="font-medium text-[var(--color-ink)]">
                  {user.role}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-canvas)] px-4 py-3 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 sm:w-auto"
          >
            <LogOut size={18} strokeWidth={2} aria-hidden />
            Выйти
          </button>
        </div>
      </div>

      <h2 className="mt-10 text-sm font-bold uppercase tracking-wider text-[var(--color-muted)]">
        Быстрые действия
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        <li>
          <Link href="/favorites" className={cn(tileClass, 'block')}>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Heart size={22} strokeWidth={2} />
            </span>
            <span>
              <span className="block font-semibold text-[var(--color-ink)]">
                Избранное
              </span>
              <span className="text-xs text-[var(--color-muted)]">
                Сохранённые товары
              </span>
            </span>
          </Link>
        </li>
        <li>
          <Link href="/cart" className={cn(tileClass, 'block')}>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-ink)]">
              <ShoppingBag size={22} strokeWidth={2} />
            </span>
            <span>
              <span className="block font-semibold text-[var(--color-ink)]">
                Корзина
              </span>
              <span className="text-xs text-[var(--color-muted)]">
                Оформить заказ
              </span>
            </span>
          </Link>
        </li>
        <li>
          <Link href="/" className={cn(tileClass, 'block')}>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-canvas)] text-[var(--color-primary)]">
              <LayoutDashboard size={22} strokeWidth={2} />
            </span>
            <span>
              <span className="block font-semibold text-[var(--color-ink)]">
                Каталог
              </span>
              <span className="text-xs text-[var(--color-muted)]">
                Все категории
              </span>
            </span>
          </Link>
        </li>
        <li>
          <div
            className={cn(tileClass, 'cursor-default opacity-75')}
            title="Скоро"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-canvas)] text-[var(--color-muted)]">
              <Package size={22} strokeWidth={2} />
            </span>
            <span>
              <span className="block font-semibold text-[var(--color-ink)]">
                Мои заказы
              </span>
              <span className="text-xs text-[var(--color-muted)]">
                Скоро появится
              </span>
            </span>
          </div>
        </li>
      </ul>

      <div className="mt-10 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-canvas)]/50 p-6 text-center">
        <Sparkles
          className="mx-auto text-[var(--color-primary)]"
          size={28}
          strokeWidth={2}
          aria-hidden
        />
        <p className="mt-3 text-sm text-[var(--color-muted)]">
          Отзывы и комментарии к товарам доступны в карточке товара — войдите под
          этим же аккаунтом.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm font-semibold text-[var(--color-primary)] hover:underline"
        >
          Перейти в каталог
        </Link>
      </div>
    </div>
  );
}
