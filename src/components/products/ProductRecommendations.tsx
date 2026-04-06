'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import api from '@/lib/api';
import type { Product } from '@/types/product';
import ProductCard from '@/components/products/ProductCard';

export default function ProductRecommendations({ productId }: { productId: number }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['recommendations', productId],
    queryFn: async () => {
      const res = await api.get<Product[]>(
        `/reviews/recommendations/for-product/${productId}`,
      );
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <section className="mt-16 border-t border-[var(--color-border)] pt-10">
        <div className="h-7 w-64 animate-pulse rounded-lg bg-[var(--color-border)]" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-3xl bg-[var(--color-border)]/60"
            />
          ))}
        </div>
      </section>
    );
  }

  if (isError || !data?.length) {
    return null;
  }

  return (
    <section className="mt-16 border-t border-[var(--color-border)] pt-10">
      <div className="flex flex-wrap items-center gap-2">
        <Sparkles className="text-[var(--color-primary)]" size={22} strokeWidth={2} />
        <h2 className="text-lg font-bold text-[var(--color-ink)]">Рекомендуем рядом</h2>
      </div>
      <p className="mt-1 max-w-2xl text-sm text-[var(--color-muted)]">
        Подборка из той же категории с учётом средней оценки покупателей.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((p) => (
          <ProductCard
            key={p.id}
            product={{
              ...p,
              price: Number(p.price),
              stock: p.stock,
            }}
          />
        ))}
      </div>
      <Link
        href="/#catalog"
        className="mt-6 inline-block text-sm font-semibold text-[var(--color-primary)] hover:underline"
      >
        Весь каталог →
      </Link>
    </section>
  );
}
