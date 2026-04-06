'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  Heart,
  LayoutDashboard,
  LayoutGrid,
  Menu,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMarketplace } from '@/providers/MarketplaceProvider';
import { useAuth } from '@/providers/AuthProvider';
import NavSearch from '@/components/layout/NavSearch';

const subNav = [
  { href: '/', label: 'Каталог', icon: LayoutGrid },
  { href: '/favorites', label: 'Избранное', icon: Heart },
  { href: '/cart', label: 'Корзина', icon: ShoppingBag },
  { href: '#', label: 'Доставка', icon: Truck },
] as const;

const MD = 768;

function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MD}px)`);
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return desktop;
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const desktop = useIsDesktop();
  const { cartItemCount, favoritesCount, hydrated } = useMarketplace();
  const { user, ready: authReady } = useAuth();

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  useEffect(() => {
    if (!mobileOpen || desktop) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobile();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileOpen, desktop, closeMobile]);

  useEffect(() => {
    if (desktop && mobileOpen) setMobileOpen(false);
  }, [desktop, mobileOpen]);

  const subNavLinkClass = (active: boolean) =>
    cn(
      'flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition-colors md:inline-flex md:px-3 md:py-2 md:text-sm',
      active
        ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm'
        : 'text-[var(--color-muted)] hover:bg-[var(--color-surface)]/80 hover:text-[var(--color-ink)]',
    );

  return (
    <header className="fixed top-0 z-50 w-full">
      <div className="border-b border-[var(--color-border)]/80 bg-[var(--color-surface)]/92 backdrop-blur-xl backdrop-saturate-150">
        <div className="container mx-auto flex h-16 items-center gap-2 px-3 sm:px-4 md:h-[4.25rem] md:gap-4">
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[var(--color-ink)] transition-colors hover:bg-[var(--color-canvas)] active:scale-[0.98] md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-drawer"
            aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
          </button>

          <Link
            href="/"
            className="group flex min-w-0 flex-1 items-center justify-center gap-2 text-[var(--color-ink)] md:flex-none md:justify-start"
            onClick={closeMobile}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-teal-600 text-white shadow-md shadow-teal-900/15 transition-transform group-hover:scale-105">
              <Sparkles size={18} strokeWidth={2.2} className="opacity-95" />
            </span>
            <span className="min-w-0 truncate text-base font-bold tracking-tight sm:text-lg">
              Qaz<span className="text-[var(--color-primary)]">Market</span>
            </span>
          </Link>

          <div className="mx-auto hidden min-w-0 max-w-xl flex-1 md:block">
            <NavSearch />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-0 sm:gap-0.5 md:gap-1">
            <Link
              href="/favorites"
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl text-[var(--color-ink)] transition-colors hover:bg-[var(--color-canvas)] sm:h-11 sm:w-11"
              aria-label="Избранное"
            >
              <Heart size={21} strokeWidth={2} className="sm:h-[22px] sm:w-[22px]" />
              {hydrated && favoritesCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {favoritesCount > 99 ? '99+' : favoritesCount}
                </span>
              )}
            </Link>
            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl text-[var(--color-ink)] transition-colors hover:bg-[var(--color-canvas)] sm:h-11 sm:w-11"
              aria-label="Корзина"
            >
              <ShoppingBag size={21} strokeWidth={2} className="sm:h-[22px] sm:w-[22px]" />
              {hydrated && cartItemCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-accent)] px-1 text-[10px] font-bold text-[var(--color-ink)]">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>
            {!authReady ? (
              <span
                className="ml-0.5 inline-block h-10 w-[5.5rem] shrink-0 animate-pulse rounded-2xl bg-[var(--color-border)]/70 sm:ml-1 sm:h-11 sm:w-28"
                aria-hidden
              />
            ) : user ? (
              <Link
                href="/account"
                className="ml-0.5 inline-flex h-10 max-w-[11rem] items-center gap-1.5 rounded-2xl bg-[var(--color-primary)] px-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/15 transition-[transform,background-color] hover:bg-[var(--color-primary-hover)] active:scale-[0.98] sm:ml-1 sm:h-11 sm:gap-2 sm:px-4"
              >
                <LayoutDashboard
                  size={17}
                  strokeWidth={2}
                  className="shrink-0 text-white sm:h-[18px] sm:w-[18px]"
                  aria-hidden
                />
                <span className="hidden truncate sm:inline">Кабинет</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="ml-0.5 inline-flex h-10 items-center gap-1.5 rounded-2xl bg-[var(--color-ink)] px-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-ink)]/10 transition-[transform,background-color] hover:bg-[var(--color-ink)]/90 active:scale-[0.98] sm:ml-1 sm:h-11 sm:gap-2 sm:px-4"
              >
                <User
                  size={17}
                  strokeWidth={2}
                  className="shrink-0 text-white sm:h-[18px] sm:w-[18px]"
                  aria-hidden
                />
                <span className="hidden sm:inline">Войти</span>
              </Link>
            )}
          </div>
        </div>

        <div className="border-t border-[var(--color-border)]/50 bg-[var(--color-canvas)]/35 px-3 py-2 md:hidden sm:px-4">
          <NavSearch />
        </div>

        <nav
          className="hidden border-t border-[var(--color-border)]/60 bg-[var(--color-canvas)]/50 md:block"
          aria-label="Разделы магазина"
        >
          <div className="container mx-auto flex items-center gap-1 overflow-x-auto px-2 py-2 scrollbar-hide md:gap-2 md:px-4">
            {subNav.map(({ href, label, icon: Icon }) => {
              const active =
                href === '#'
                  ? false
                  : href === '/'
                    ? pathname === '/' || pathname.startsWith('/products/')
                    : href === '/cart'
                      ? pathname === '/cart' || pathname.startsWith('/checkout')
                      : pathname === href;
              return (
                <Link key={label} href={href} className={subNavLinkClass(active)}>
                  <Icon size={17} strokeWidth={2} />
                  {label}
                </Link>
              );
            })}
            {authReady && user ? (
              <Link
                href="/account"
                className={subNavLinkClass(pathname === '/account')}
              >
                <LayoutDashboard size={17} strokeWidth={2} />
                Кабинет
              </Link>
            ) : null}
          </div>
        </nav>
      </div>

      <div
        className={cn(
          'fixed inset-0 z-[55] bg-[var(--color-ink)]/40 backdrop-blur-[2px] transition-opacity duration-300 md:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden={!mobileOpen}
        onClick={closeMobile}
      />

      <div
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Меню навигации"
        className={cn(
          'fixed inset-y-0 left-0 z-[60] flex w-[min(20rem,calc(100vw-2.5rem))] max-w-[100vw] flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl transition-transform duration-300 ease-out md:hidden',
          mobileOpen ? 'translate-x-0' : 'pointer-events-none -translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] px-4">
          <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-muted)]">
            Меню
          </span>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--color-ink)] hover:bg-[var(--color-canvas)]"
            aria-label="Закрыть меню"
            onClick={closeMobile}
          >
            <X size={22} strokeWidth={2} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-4" aria-label="Разделы">
          <ul className="space-y-1">
            {subNav.map(({ href, label, icon: Icon }) => {
              const active =
                href === '#'
                  ? false
                  : href === '/'
                    ? pathname === '/' || pathname.startsWith('/products/')
                    : href === '/cart'
                      ? pathname === '/cart' || pathname.startsWith('/checkout')
                      : pathname === href;
              return (
                <li key={label}>
                  <Link
                    href={href}
                    className={subNavLinkClass(active)}
                    onClick={closeMobile}
                  >
                    <Icon size={20} strokeWidth={2} />
                    {label}
                  </Link>
                </li>
              );
            })}
            {authReady && user ? (
              <li>
                <Link
                  href="/account"
                  className={subNavLinkClass(pathname === '/account')}
                  onClick={closeMobile}
                >
                  <LayoutDashboard size={20} strokeWidth={2} />
                  Личный кабинет
                </Link>
              </li>
            ) : null}
          </ul>

          <div className="mt-8 border-t border-[var(--color-border)] pt-6">
            {authReady && user ? (
              <>
                <p className="mb-3 truncate px-1 text-center text-xs text-[var(--color-muted)]">
                  {user.email}
                </p>
                <Link
                  href="/account"
                  onClick={closeMobile}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/20"
                >
                  <LayoutDashboard size={18} strokeWidth={2} aria-hidden />
                  Личный кабинет
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                onClick={closeMobile}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/20"
              >
                <User size={18} strokeWidth={2} aria-hidden />
                Войти в аккаунт
              </Link>
            )}
            <p className="mt-4 px-1 text-center text-xs leading-relaxed text-[var(--color-muted)]">
              Поиск по каталогу — в строке над страницей.
            </p>
          </div>
        </nav>
      </div>
    </header>
  );
}
