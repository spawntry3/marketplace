'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Heart,
  LayoutGrid,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMarketplace } from '@/providers/MarketplaceProvider';
import NavSearch from '@/components/layout/NavSearch';

const subNav = [
  { href: '/', label: 'Каталог', icon: LayoutGrid },
  { href: '/favorites', label: 'Избранное', icon: Heart },
  { href: '/cart', label: 'Корзина', icon: ShoppingBag },
  { href: '#', label: 'Доставка', icon: Truck },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const {
    cartItemCount,
    favoritesCount,
    hydrated,
  } = useMarketplace();

  return (
    <header className="fixed top-0 z-50 w-full">
      <div className="border-b border-[var(--color-border)]/80 bg-[var(--color-surface)]/90 backdrop-blur-xl backdrop-saturate-150">
        <div className="container mx-auto flex h-16 items-center gap-3 px-4 sm:gap-4">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2 text-[var(--color-ink)]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-teal-600 text-white shadow-md shadow-teal-900/15 transition-transform group-hover:scale-105">
              <Sparkles size={18} strokeWidth={2.2} className="opacity-95" />
            </span>
            <span className="text-lg font-bold tracking-tight">
              Qaz<span className="text-[var(--color-primary)]">Market</span>
            </span>
          </Link>

          <div className="mx-auto hidden min-w-0 max-w-xl flex-1 sm:block">
            <NavSearch />
          </div>

          <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
            <Link
              href="/favorites"
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl text-[var(--color-ink)] transition-colors hover:bg-[var(--color-canvas)]"
              aria-label="Избранное"
            >
              <Heart size={22} strokeWidth={2} />
              {hydrated && favoritesCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {favoritesCount > 99 ? '99+' : favoritesCount}
                </span>
              )}
            </Link>
            <Link
              href="/cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl text-[var(--color-ink)] transition-colors hover:bg-[var(--color-canvas)]"
              aria-label="Корзина"
            >
              <ShoppingBag size={22} strokeWidth={2} />
              {hydrated && cartItemCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-accent)] px-1 text-[10px] font-bold text-[var(--color-ink)]">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>
            <Link
              href="/login"
              className="ml-1 inline-flex h-11 items-center gap-2 rounded-2xl bg-[var(--color-ink)] px-3 text-sm font-semibold text-white shadow-lg shadow-[var(--color-ink)]/10 transition-[transform,background-color] hover:bg-[var(--color-ink)]/90 active:scale-[0.98] sm:px-4"
            >
              <User
                size={18}
                strokeWidth={2}
                className="shrink-0 text-white"
                aria-hidden
              />
              <span className="hidden sm:inline">Войти</span>
            </Link>
          </div>
        </div>

        <nav
          className="border-t border-[var(--color-border)]/60 bg-[var(--color-canvas)]/50"
          aria-label="Разделы магазина"
        >
          <div className="container mx-auto flex items-center gap-1 overflow-x-auto px-2 py-2 scrollbar-hide sm:gap-2 sm:px-4">
            {subNav.map(({ href, label, icon: Icon }) => {
              const active =
                href === '#'
                  ? false
                  : href === '/'
                    ? pathname === '/' || pathname.startsWith('/products/')
                    : href === '/cart'
                      ? pathname === '/cart' ||
                        pathname.startsWith('/checkout')
                      : pathname === href;
              return (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm'
                      : 'text-[var(--color-muted)] hover:bg-[var(--color-surface)]/80 hover:text-[var(--color-ink)]',
                  )}
                >
                  <Icon size={17} strokeWidth={2} />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
