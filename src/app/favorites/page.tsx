'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import api from '@/lib/api';
import ProductCard from '@/components/products/ProductCard';
import type { Product } from '@/types/product';
import { useMarketplace } from '@/providers/MarketplaceProvider';

export default function FavoritesPage() {
  const { favorites, hydrated } = useMarketplace();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get<Product[]>('/products');
      return res.data;
    },
  });

  const favoriteSet = new Set(favorites);
  const list =
    products?.filter((p) => favoriteSet.has(p.id)) ?? [];

  return (
    <div className="container mx-auto px-4 py-8 md:py-10">
      <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)] md:text-3xl">
            Избранное
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Сохранённые товары на этом устройстве
          </p>
        </div>
        {hydrated && favorites.length > 0 && (
          <span className="text-sm font-medium text-[var(--color-muted)]">
            Сохранено позиций: {favorites.length}
          </span>
        )}
      </div>

      {!hydrated || isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[22rem] animate-pulse rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]"
            />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] py-20 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-canvas)] text-[var(--color-muted)]">
            <Heart size={32} strokeWidth={2} />
          </span>
          <p className="mt-6 max-w-sm text-[var(--color-muted)]">
            Здесь появятся товары, которые вы добавите в избранное нажатием на
            сердечко.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex rounded-2xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
          >
            Перейти в каталог
          </Link>
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-[2rem] border border-[var(--color-border)] bg-amber-50/80 px-6 py-10 text-center text-amber-900">
          <p className="font-medium">
            Сохранённые товары больше не продаются или временно недоступны.
          </p>
          <Link href="/" className="mt-4 inline-block font-semibold underline">
            В каталог
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => (
            <ProductCard
              key={p.id}
              product={{
                ...p,
                price: Number(p.price),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
