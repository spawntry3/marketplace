'use client';

import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import api from '@/lib/api';
import type { ProductReviewBundle } from '@/types/review';
import { cn } from '@/lib/utils';

export default function ProductRatingBadge({ productId }: { productId: number }) {
  const { data } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const res = await api.get<ProductReviewBundle>(`/reviews/product/${productId}`);
      return res.data;
    },
  });

  if (!data || data.totalReviews === 0) return null;

  const rounded = Math.round(data.averageRating);

  return (
    <div
      className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)]/60 px-3 py-1.5 text-sm"
      title={`Средняя оценка ${data.averageRating.toFixed(1)} по ${data.totalReviews} отзывам`}
    >
      <span className="flex items-center gap-0.5 text-amber-500">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={16}
            strokeWidth={2}
            className={cn(
              n <= rounded ? 'fill-amber-400 text-amber-500' : 'fill-transparent text-[var(--color-border)]',
            )}
          />
        ))}
      </span>
      <span className="font-bold tabular-nums text-[var(--color-ink)]">
        {data.averageRating.toFixed(1)}
      </span>
      <span className="text-[var(--color-muted)]">({data.totalReviews})</span>
    </div>
  );
}
