'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import type { Product } from '@/types/product';
import { getProductVisual } from '@/lib/product-visual';
import { cn } from '@/lib/utils';
import { useMarketplace } from '@/providers/MarketplaceProvider';

export default function CartPage() {
  const { cart, setCartQty, removeFromCart, hydrated } = useMarketplace();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get<Product[]>('/products');
      return res.data;
    },
  });

  const entries = Object.entries(cart)
    .map(([id, qty]) => ({ id: Number(id), qty }))
    .filter((e) => e.qty > 0 && Number.isFinite(e.id));

  const byId = new Map(products?.map((p) => [p.id, p]) ?? []);

  const lines = entries
    .map(({ id, qty }) => {
      const p = byId.get(id);
      return p ? { product: p, qty } : null;
    })
    .filter(Boolean) as { product: Product; qty: number }[];

  const missingIds = entries
    .filter((e) => !byId.has(e.id))
    .map((e) => e.id);

  const subtotal = lines.reduce((sum, { product, qty }) => {
    const effective = Math.min(qty, Math.max(0, product.stock));
    return sum + Number(product.price) * effective;
  }, 0);

  return (
    <div className="container mx-auto px-4 py-8 md:py-10">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)] md:text-3xl">
        Корзина
      </h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Проверьте состав заказа перед оформлением
      </p>

      {!hydrated || isLoading ? (
        <div className="mt-10 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-[var(--color-border)]/70"
            />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] py-20 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-canvas)] text-[var(--color-muted)]">
            <ShoppingBag size={32} strokeWidth={2} />
          </span>
          <p className="mt-6 max-w-sm text-[var(--color-muted)]">
            Корзина пуста. Добавляйте товары из каталога или со страницы
            товара.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex rounded-2xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
          >
            В каталог
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
          <div className="space-y-4">
            {missingIds.length > 0 && (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Некоторые позиции недоступны в каталоге и скрыты из суммы.
              </p>
            )}
            {lines.map(({ product, qty }) => {
              const visual = getProductVisual(product.category);
              const max = Math.max(1, product.stock);
              const clampedQty = Math.min(qty, max);
              return (
                <div
                  key={product.id}
                  className="flex gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm sm:gap-5 sm:p-5"
                >
                  <Link
                    href={`/products/${product.id}`}
                    className={cn(
                      'relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--color-border)] sm:h-28 sm:w-28',
                      !product.imageUrl && 'bg-gradient-to-br',
                      !product.imageUrl && visual.gradient,
                    )}
                  >
                    {product.imageUrl ? (
                      <>
                        <span className="absolute inset-0 bg-white" />
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="112px"
                          className="object-contain p-1.5"
                        />
                      </>
                    ) : (
                      <span className="relative text-4xl">{visual.emoji}</span>
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${product.id}`}
                      className="font-semibold text-[var(--color-ink)] hover:text-[var(--color-primary)]"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-sm text-[var(--color-muted)] line-clamp-2">
                      {product.description}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <div className="flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] p-0.5">
                        <button
                          type="button"
                          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[var(--color-surface)]"
                          aria-label="Уменьшить количество"
                          onClick={() => setCartQty(product.id, qty - 1)}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="min-w-[2rem] text-center text-sm font-bold tabular-nums">
                          {clampedQty}
                        </span>
                        <button
                          type="button"
                          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[var(--color-surface)] disabled:opacity-40"
                          aria-label="Увеличить количество"
                          onClick={() => setCartQty(product.id, qty + 1)}
                          disabled={qty >= max}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(product.id)}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                        Удалить
                      </button>
                    </div>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-sm text-[var(--color-muted)]">Сумма</p>
                    <p className="mt-1 text-lg font-bold tabular-nums text-[var(--color-ink)]">
                      {(Number(product.price) * clampedQty).toLocaleString(
                        'kk-KZ',
                      )}{' '}
                      ₸
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      {Number(product.price).toLocaleString('kk-KZ')} ₸ ×{' '}
                      {clampedQty}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg shadow-[var(--color-ink)]/[0.03] lg:sticky lg:top-[8rem]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-muted)]">
              Ваш заказ
            </h2>
            <p className="mt-4 flex items-baseline justify-between gap-4">
              <span className="text-[var(--color-muted)]">Товары</span>
              <span className="text-xl font-bold tabular-nums text-[var(--color-ink)]">
                {subtotal.toLocaleString('kk-KZ')} ₸
              </span>
            </p>
            <p className="mt-2 text-xs text-[var(--color-muted)]">
              Доставка и итоговая стоимость рассчитываются при оформлении
              (демо).
            </p>
            <Link
              href="/checkout"
              className="mt-6 flex w-full items-center justify-center rounded-2xl bg-[var(--color-ink)] py-3.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[var(--color-ink)]/90"
            >
              Перейти к оформлению
            </Link>
            <Link
              href="/"
              className="mt-3 block w-full rounded-2xl border border-[var(--color-border)] py-3 text-center text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-canvas)]"
            >
              Продолжить покупки
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
