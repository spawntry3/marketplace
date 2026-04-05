'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Cpu,
  Gamepad2,
  HardDrive,
  LayoutGrid,
  Monitor,
  MemoryStick,
} from 'lucide-react';
import api from '@/lib/api';
import ProductCard from '@/components/products/ProductCard';
import type { Product } from '@/types/product';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'Все', label: 'Все', icon: LayoutGrid },
  { id: 'GPU', label: 'GPU', icon: Gamepad2 },
  { id: 'CPU', label: 'CPU', icon: Cpu },
  { id: 'RAM', label: 'RAM', icon: MemoryStick },
  { id: 'SSD', label: 'SSD', icon: HardDrive },
  { id: 'Monitor', label: 'Мониторы', icon: Monitor },
] as const;

function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-10 h-48 animate-pulse rounded-[2rem] bg-[var(--color-border)]/60 md:h-56" />
      <div className="mb-8 flex gap-2 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-11 w-28 shrink-0 animate-pulse rounded-2xl bg-[var(--color-border)]/80"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="h-[22rem] animate-pulse rounded-3xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]"
          />
        ))}
      </div>
    </div>
  );
}

function HomePageInner() {
  const searchParams = useSearchParams();
  const searchRaw = searchParams.get('q')?.trim() ?? '';
  const searchLower = searchRaw.toLowerCase();

  const [activeCategory, setActiveCategory] =
    useState<(typeof CATEGORIES)[number]['id']>('Все');

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get<Product[]>('/products');
      return response.data;
    },
    retry: 1,
  });

  const filteredProducts = useMemo(() => {
    if (!products) return undefined;
    let list =
      activeCategory === 'Все'
        ? products
        : products.filter((p: Product) => p.category === activeCategory);

    if (searchLower) {
      list = list.filter((p: Product) => {
        const name = (p.name ?? '').toLowerCase();
        const desc = (p.description ?? '').toLowerCase();
        const cat = (p.category ?? '').toLowerCase();
        return (
          name.includes(searchLower) ||
          desc.includes(searchLower) ||
          cat.includes(searchLower)
        );
      });
    }

    return list;
  }, [products, activeCategory, searchLower]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto flex min-h-[55vh] flex-col items-center justify-center px-4">
        <div className="max-w-md rounded-[2rem] border border-red-200/80 bg-red-50/90 p-10 text-center shadow-lg shadow-red-900/5 backdrop-blur-sm">
          <div className="mb-4 text-4xl" aria-hidden>
            🔌
          </div>
          <h2 className="text-xl font-bold text-red-900">Бэкенд не отвечает</h2>
          <p className="mt-2 text-sm leading-relaxed text-red-800/85">
            Запустите NestJS на порту{' '}
            <code className="rounded-md bg-red-100 px-1.5 py-0.5 font-mono text-sm font-semibold">
              3001
            </code>
            , затем обновите страницу.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-8 w-full rounded-2xl bg-red-700 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-red-800"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-10">
      <section className="relative mb-12 overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl shadow-[var(--color-ink)]/[0.04] md:mb-14">
        <div
          className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[var(--color-primary)]/15 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[var(--color-accent)]/20 blur-3xl"
          aria-hidden
        />
        <div className="relative grid gap-8 p-8 md:grid-cols-[1.15fr_1fr] md:p-10 lg:p-12">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
              Маркетплейс техники
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-[var(--color-ink)] md:text-4xl lg:text-[2.65rem] lg:leading-[1.1]">
              Собери идеальный ПК —{' '}
              <span className="bg-gradient-to-r from-[var(--color-primary)] to-teal-500 bg-clip-text text-transparent">
                без лишнего шума
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
              Видеокарты, процессоры, память и накопители в одном каталоге.
              Фильтруй по категориям и находи железо под свои задачи.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#catalog"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-ink)] px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-[transform,background-color] hover:bg-[var(--color-ink)]/90 active:scale-[0.98]"
              >
                <LayoutGrid
                  size={18}
                  strokeWidth={2}
                  className="shrink-0 text-white"
                  aria-hidden
                />
                К каталогу
              </a>
              <span className="text-sm text-[var(--color-muted)]">
                Доставка по Казахстану · Оплата удобным способом
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-4 rounded-2xl border border-[var(--color-border)]/80 bg-[var(--color-canvas)]/80 p-6 backdrop-blur-sm md:p-8">
            {[
              { value: '500+', label: 'позиций в каталоге' },
              { value: '24ч', label: 'среднее время ответа' },
              { value: '100%', label: 'проверенные поставщики' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-baseline justify-between gap-4 border-b border-[var(--color-border)]/60 pb-4 last:border-0 last:pb-0"
              >
                <span className="text-2xl font-bold tabular-nums text-[var(--color-ink)] md:text-3xl">
                  {item.value}
                </span>
                <span className="text-right text-sm text-[var(--color-muted)]">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="catalog" className="scroll-mt-28">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--color-ink)] md:text-3xl">
              {activeCategory === 'Все'
                ? 'Каталог'
                : CATEGORIES.find((c) => c.id === activeCategory)?.label}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {searchRaw ? (
                <>
                  По запросу «{searchRaw}»: найдено {filteredProducts?.length ?? 0}
                </>
              ) : (
                <>Найдено: {filteredProducts?.length ?? 0}</>
              )}
            </p>
          </div>
        </div>

        <div className="scrollbar-hide mb-10 flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(({ id, label, icon: Icon }) => {
            const active = activeCategory === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveCategory(id)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-all duration-200',
                  active
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-lg shadow-teal-900/15'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:border-[var(--color-primary)]/35 hover:text-[var(--color-ink)]',
                )}
              >
                <Icon size={18} strokeWidth={2} className="opacity-90" />
                {label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts?.map((product: Product) => (
            <ProductCard
              key={product.id}
              product={{
                ...product,
                price: Number(product.price),
              }}
            />
          ))}
        </div>

        {filteredProducts?.length === 0 && (
          <div className="rounded-[2rem] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] py-20 text-center">
            <p className="text-[var(--color-muted)]">
              {searchRaw
                ? `Ничего не найдено по запросу «${searchRaw}». Попробуйте другое название или сбросьте поиск.`
                : 'В этой категории пока нет товаров.'}
            </p>
            {searchRaw && (
              <a
                href="/"
                className="mt-4 inline-block text-sm font-semibold text-[var(--color-primary)] hover:underline"
              >
                Сбросить поиск
              </a>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <HomePageInner />
    </Suspense>
  );
}
