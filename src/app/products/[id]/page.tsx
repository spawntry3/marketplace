'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronRight,
  Heart,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { getProductVisual } from '@/lib/product-visual';
import type { Product } from '@/types/product';
import { useMarketplace } from '@/providers/MarketplaceProvider';
import ProductRatingBadge from '@/components/products/ProductRatingBadge';
import ProductReviewsSection from '@/components/products/ProductReviewsSection';
import ProductRecommendations from '@/components/products/ProductRecommendations';

export default function ProductPage() {
  const params = useParams();
  const rawId = params.id;
  const id = typeof rawId === 'string' ? Number(rawId) : NaN;
  const valid = Number.isFinite(id) && id > 0;

  const {
    toggleFavorite,
    isFavorite,
    addToCart,
    cart,
    setCartQty,
  } = useMarketplace();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get<Product>(`/products/${id}`);
      return res.data;
    },
    enabled: valid,
    retry: 1,
  });

  const favorite = product ? isFavorite(product.id) : false;
  const inCartQty = product ? (cart[product.id] ?? 0) : 0;
  const visual = product ? getProductVisual(product.category) : getProductVisual(null);

  if (!valid) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-[var(--color-muted)]">Некорректная ссылка на товар.</p>
        <Link
          href="/"
          className="mt-4 inline-block text-[var(--color-primary)] font-semibold hover:underline"
        >
          На главную
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="h-4 w-48 animate-pulse rounded-lg bg-[var(--color-border)]" />
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-[2rem] bg-[var(--color-border)]/80" />
          <div className="space-y-4">
            <div className="h-10 w-3/4 animate-pulse rounded-lg bg-[var(--color-border)]" />
            <div className="h-24 animate-pulse rounded-xl bg-[var(--color-border)]/60" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-[var(--color-ink)]">Товар не найден</h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Возможно, позиция снята с продажи или ссылка устарела.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white"
        >
          В каталог
        </Link>
      </div>
    );
  }

  const priceNum = Number(product.price);
  const lowStock = product.stock > 0 && product.stock <= 5;
  const outOfStock = product.stock <= 0;

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      <nav
        className="mb-8 flex flex-wrap items-center gap-1 text-sm text-[var(--color-muted)]"
        aria-label="Хлебные крошки"
      >
        <Link href="/" className="hover:text-[var(--color-primary)]">
          Главная
        </Link>
        <ChevronRight size={14} className="shrink-0 opacity-60" />
        <Link href="/#catalog" className="hover:text-[var(--color-primary)]">
          Каталог
        </Link>
        <ChevronRight size={14} className="shrink-0 opacity-60" />
        <span className="line-clamp-1 text-[var(--color-ink)]">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
        <div
          className={cn(
            'relative flex aspect-square max-h-[min(520px,80vw)] items-center justify-center overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-canvas)]',
            !product.imageUrl && 'bg-gradient-to-br',
            !product.imageUrl && visual.gradient,
          )}
        >
          {product.imageUrl ? (
            <>
              <div className="absolute inset-0 bg-white" />
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-6 md:p-10"
                priority
              />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.55),transparent_55%)]" />
              <span className="relative text-[clamp(4rem,18vw,8rem)] leading-none">
                {visual.emoji}
              </span>
            </>
          )}
          <span className="pointer-events-none absolute left-4 top-4 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/95 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] backdrop-blur-sm">
            {visual.label}
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-bold leading-tight text-[var(--color-ink)] md:text-3xl lg:text-4xl">
            {product.name}
          </h1>

          <ProductRatingBadge productId={product.id} />

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-lg bg-[var(--color-canvas)] px-3 py-1 font-mono text-[var(--color-muted)]">
              Арт. {product.id}
            </span>
            {outOfStock ? (
              <span className="font-semibold text-red-600">Нет в наличии</span>
            ) : lowStock ? (
              <span className="font-semibold text-amber-700">Осталось мало: {product.stock} шт.</span>
            ) : (
              <span className="text-[var(--color-muted)]">В наличии: {product.stock} шт.</span>
            )}
          </div>

          <p className="mt-6 text-lg font-bold tabular-nums text-[var(--color-ink)] md:text-2xl">
            {priceNum.toLocaleString('kk-KZ')}
            <span className="ml-2 text-base font-semibold text-[var(--color-muted)] md:text-lg">
              ₸
            </span>
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => toggleFavorite(product.id)}
              className={cn(
                'inline-flex h-12 items-center gap-2 rounded-2xl border-2 border-[var(--color-border)] px-5 font-semibold transition-colors',
                favorite
                  ? 'border-rose-200 bg-rose-50 text-rose-600'
                  : 'bg-[var(--color-surface)] text-[var(--color-ink)] hover:border-rose-200 hover:text-rose-500',
              )}
            >
              <Heart
                size={20}
                className={cn(favorite && 'fill-current')}
                strokeWidth={2}
              />
              {favorite ? 'В избранном' : 'В избранное'}
            </button>

            {!outOfStock && (
              <div className="flex items-center gap-2">
                {inCartQty > 0 ? (
                  <div className="flex items-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] p-1">
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-[var(--color-surface)]"
                      aria-label="Меньше"
                      onClick={() =>
                        setCartQty(product.id, inCartQty - 1)
                      }
                    >
                      <Minus size={18} />
                    </button>
                    <span className="min-w-[2rem] text-center text-sm font-bold tabular-nums">
                      {inCartQty}
                    </span>
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-[var(--color-surface)]"
                      aria-label="Больше"
                      onClick={() =>
                        setCartQty(product.id, inCartQty + 1)
                      }
                      disabled={inCartQty >= product.stock}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                ) : null}
                <button
                  type="button"
                  disabled={outOfStock}
                  onClick={() => addToCart(product.id, 1)}
                  className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[var(--color-primary)] px-6 font-semibold text-white shadow-lg shadow-teal-900/15 transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingCart size={20} strokeWidth={2} />
                  В корзину
                </button>
              </div>
            )}
          </div>

          <div className="mt-10 space-y-6 border-t border-[var(--color-border)] pt-10">
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-muted)]">
                Описание
              </h2>
              <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-[var(--color-ink)]/90">
                {product.description}
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-muted)]">
                Характеристики
              </h2>
              <dl className="mt-3 divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)]/40">
                {[
                  ['Категория', visual.label],
                  ['Наличие на складе', `${product.stock} шт.`],
                  ['Гарантия', 'Официальная от производителя'],
                  ['Доставка', 'По Казахстану, уточняйте сроки при заказе'],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:justify-between sm:gap-8"
                  >
                    <dt className="text-sm text-[var(--color-muted)]">{k}</dt>
                    <dd className="text-sm font-medium text-[var(--color-ink)]">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <ul className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: Truck, t: 'Доставка', d: 'Курьером и в пункты выдачи' },
                { icon: ShieldCheck, t: 'Гарантия', d: 'Подлинность и документы' },
                { icon: Package, t: 'Упаковка', d: 'Защита при отправке' },
              ].map(({ icon: Icon, t, d }) => (
                <li
                  key={t}
                  className="flex gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-canvas)] text-[var(--color-primary)]">
                    <Icon size={20} strokeWidth={2} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-[var(--color-ink)]">
                      {t}
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
                      {d}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <ProductReviewsSection productId={product.id} />
        </div>
      </div>

      <ProductRecommendations productId={product.id} />
    </div>
  );
}
