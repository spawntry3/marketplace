'use client';

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

const DEBOUNCE_MS = 320;

function NavSearchFields() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qParam = searchParams.get('q') ?? '';

  const [value, setValue] = useState(qParam);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(qParam);
  }, [qParam]);

  const pushQuery = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      const next = trimmed ? `/?q=${encodeURIComponent(trimmed)}` : '/';
      if (pathname === '/') {
        router.replace(next, { scroll: false });
      } else {
        router.push(next);
      }
    },
    [pathname, router],
  );

  const scheduleCommit = useCallback(
    (raw: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => pushQuery(raw), DEBOUNCE_MS);
    },
    [pushQuery],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <form
      className="relative mx-auto min-w-0 max-w-xl flex-1"
      onSubmit={(e) => {
        e.preventDefault();
        if (timerRef.current) clearTimeout(timerRef.current);
        pushQuery(value);
      }}
      role="search"
    >
      <label htmlFor="nav-search" className="sr-only">
        Поиск товаров
      </label>
      <Search
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
        size={18}
        strokeWidth={2}
        aria-hidden
      />
      <input
        id="nav-search"
        type="search"
        name="q"
        placeholder="Название товара..."
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          setValue(v);
          scheduleCommit(v);
        }}
        autoComplete="off"
        className="h-11 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] pl-11 pr-4 text-sm text-[var(--color-ink)] outline-none transition-[border-color,box-shadow] placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)]/40 focus:ring-2 focus:ring-[var(--color-primary)]/20"
      />
    </form>
  );
}

function NavSearchFallback() {
  return (
    <div
      className="mx-auto h-11 min-w-0 max-w-xl flex-1 rounded-2xl bg-[var(--color-canvas)] animate-pulse"
      aria-hidden
    />
  );
}

export default function NavSearch() {
  return (
    <Suspense fallback={<NavSearchFallback />}>
      <NavSearchFields />
    </Suspense>
  );
}
