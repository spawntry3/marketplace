'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Star } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ProductReviewBundle } from '@/types/review';

function StarsRow({
  value,
  onChange,
  readOnly,
  size = 20,
}: {
  value: number;
  onChange?: (n: number) => void;
  readOnly?: boolean;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-0.5" role={readOnly ? undefined : 'radiogroup'}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className={cn(
            'rounded p-0.5 transition-colors',
            !readOnly && 'hover:bg-amber-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-amber-400',
            readOnly && 'cursor-default',
          )}
          aria-label={readOnly ? undefined : `${n} из 5 звёзд`}
        >
          <Star
            size={size}
            strokeWidth={2}
            className={cn(
              n <= value
                ? 'fill-amber-400 text-amber-500'
                : 'fill-transparent text-[var(--color-border)]',
            )}
          />
        </button>
      ))}
    </div>
  );
}

function formatReviewDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function ProductReviewsSection({ productId }: { productId: number }) {
  const qc = useQueryClient();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const bundleQuery = useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const res = await api.get<ProductReviewBundle>(`/reviews/product/${productId}`);
      return res.data;
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/reviews/product/${productId}`, {
        rating,
        text: text.trim(),
      });
      return res.data;
    },
    onSuccess: () => {
      setText('');
      setRating(5);
      setFormError(null);
      qc.invalidateQueries({ queryKey: ['reviews', productId] });
    },
    onError: (err: unknown) => {
      const ax = err as { response?: { data?: { message?: string | string[] } } };
      const m = ax.response?.data?.message;
      setFormError(
        Array.isArray(m) ? m.join(', ') : m ?? 'Не удалось отправить отзыв',
      );
    },
  });

  const commentMutation = useMutation({
    mutationFn: async ({ reviewId, text: body }: { reviewId: number; text: string }) => {
      const res = await api.post(`/reviews/comments/${reviewId}`, { text: body.trim() });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', productId] });
    },
  });

  const hasToken =
    typeof window !== 'undefined' && !!localStorage.getItem('access_token');

  if (bundleQuery.isLoading) {
    return (
      <section className="mt-12 border-t border-[var(--color-border)] pt-10">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[var(--color-border)]" />
        <div className="mt-6 h-32 animate-pulse rounded-2xl bg-[var(--color-border)]/70" />
      </section>
    );
  }

  if (bundleQuery.isError || !bundleQuery.data) {
    return (
      <section className="mt-12 border-t border-[var(--color-border)] pt-10">
        <p className="text-sm text-[var(--color-muted)]">
          Не удалось загрузить отзывы. Попробуйте обновить страницу.
        </p>
      </section>
    );
  }

  const bundle = bundleQuery.data;

  return (
    <section className="mt-12 border-t border-[var(--color-border)] pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-ink)]">Отзывы и оценка</h2>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <StarsRow value={Math.round(bundle.averageRating)} readOnly size={22} />
            <span className="text-2xl font-bold tabular-nums text-[var(--color-ink)]">
              {bundle.averageRating > 0 ? bundle.averageRating.toFixed(1) : '—'}
            </span>
            <span className="text-sm text-[var(--color-muted)]">
              {bundle.totalReviews} оценок
            </span>
          </div>
        </div>
      </div>

      {hasToken ? (
        <form
          className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)]/50 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            setFormError(null);
            reviewMutation.mutate();
          }}
        >
          <h3 className="text-sm font-semibold text-[var(--color-ink)]">Ваш отзыв</h3>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Один отзыв на товар с вашего аккаунта. Ниже можно комментировать любые отзывы.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
              Оценка
            </span>
            <StarsRow value={rating} onChange={setRating} />
          </div>
          <textarea
            className="mt-4 min-h-[100px] w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            placeholder="Расскажите, что понравилось или что стоит знать другим покупателям (не короче 10 символов)…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={4000}
          />
          {formError ? (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {formError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={reviewMutation.isPending || text.trim().length < 10}
            className="mt-4 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {reviewMutation.isPending ? 'Отправка…' : 'Опубликовать отзыв'}
          </button>
        </form>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 text-sm text-[var(--color-muted)]">
          Чтобы оставить отзыв или комментарий,{' '}
          <Link href="/login" className="font-semibold text-[var(--color-primary)] underline">
            войдите в аккаунт
          </Link>
          .
        </p>
      )}

      <ul className="mt-10 space-y-8">
        {bundle.reviews.length === 0 ? (
          <li className="text-sm text-[var(--color-muted)]">
            Пока нет отзывов — станьте первым.
          </li>
        ) : (
          bundle.reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <StarsRow value={r.rating} readOnly size={18} />
                <span className="text-xs text-[var(--color-muted)]">
                  {r.author} · {formatReviewDate(r.createdAt)}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[var(--color-ink)]">
                {r.text}
              </p>

              {r.comments.length > 0 ? (
                <ul className="mt-4 space-y-3 border-l-2 border-[var(--color-border)] pl-4">
                  {r.comments.map((c) => (
                    <li key={c.id}>
                      <p className="text-sm text-[var(--color-ink)]">{c.text}</p>
                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        {c.author} · {formatReviewDate(c.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : null}

              {hasToken ? (
                <div className="mt-4 flex flex-col gap-2 border-t border-[var(--color-border)] pt-4">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-muted)]">
                    <MessageCircle size={14} />
                    Комментарий к отзыву
                  </span>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      className="min-w-0 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 text-sm text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                      placeholder="Ваш комментарий…"
                      value={commentDrafts[r.id] ?? ''}
                      onChange={(e) =>
                        setCommentDrafts((prev) => ({ ...prev, [r.id]: e.target.value }))
                      }
                      maxLength={2000}
                    />
                    <button
                      type="button"
                      disabled={
                        commentMutation.isPending ||
                        !(commentDrafts[r.id]?.trim())
                      }
                      onClick={() => {
                        const body = commentDrafts[r.id]?.trim() ?? '';
                        if (!body) return;
                        commentMutation.mutate(
                          { reviewId: r.id, text: body },
                          {
                            onSuccess: () => {
                              setCommentDrafts((prev) => ({ ...prev, [r.id]: '' }));
                            },
                          },
                        );
                      }}
                      className="shrink-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-canvas)] disabled:opacity-50"
                    >
                      {commentMutation.isPending ? '…' : 'Отправить'}
                    </button>
                  </div>
                </div>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
