'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProductVisual } from '@/lib/product-visual';
import { useMarketplace } from '@/providers/MarketplaceProvider';

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  category?: string;
  stock?: number;
  imageUrl?: string | null;
}

export default function ProductCard({ product }: { product: Product }) {
  const { toggleFavorite, isFavorite, addToCart } = useMarketplace();
  const favorite = isFavorite(product.id);
  const cat = product.category ?? '';
  const visual = getProductVisual(cat);
  const lowStock =
    product.stock !== undefined && product.stock > 0 && product.stock <= 5;

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm transition-[box-shadow,transform] duration-300',
        'hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--color-ink)]/5',
      )}
    >
      <Link
        href={`/products/${product.id}`}
        className="absolute inset-0 z-0 rounded-3xl outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        aria-label={`Открыть ${product.name}`}
      />

      <div
        className={cn(
          'pointer-events-none relative z-[1] aspect-[4/3] overflow-hidden bg-[var(--color-canvas)]',
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
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.5),transparent_55%)] opacity-80" />
            <span
              className="relative flex h-full items-center justify-center text-6xl transition-transform duration-500 group-hover:scale-110"
              aria-hidden
            >
              {visual.emoji}
            </span>
          </>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-[var(--color-border)]/60 bg-[var(--color-surface)]/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)] backdrop-blur-sm">
            {visual.label}
          </span>
          {lowStock && (
            <span className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-900/90">
              Мало на складе
            </span>
          )}
        </div>
      </div>

      <div className="relative z-[2] flex flex-1 flex-col p-5 pt-4">
        <h3 className="pointer-events-none line-clamp-2 min-h-[3rem] text-base font-bold leading-snug text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-primary)]">
          {product.name}
        </h3>
        <p className="pointer-events-none mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-[var(--color-muted)]">
          {product.description ||
            'Надёжное решение для игр, работы и творчества.'}
        </p>

        <div className="relative z-[2] mt-5 flex items-end justify-between gap-3 border-t border-[var(--color-border)]/80 pt-4">
          <div className="pointer-events-none">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)]">
              Цена
            </p>
            <p className="text-xl font-bold tabular-nums text-[var(--color-ink)]">
              {Number(product.price).toLocaleString('kk-KZ')}
              <span className="ml-1 text-base font-semibold text-[var(--color-muted)]">
                ₸
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(product.id);
              }}
              className={cn(
                'relative z-[3] flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] shadow-sm transition-all hover:border-rose-200 hover:text-rose-500',
                favorite && 'border-rose-200 bg-rose-50 text-rose-500',
              )}
              aria-label={
                favorite ? 'Убрать из избранного' : 'В избранное'
              }
            >
              <Heart
                size={20}
                strokeWidth={2}
                className={cn(favorite && 'fill-current')}
              />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product.id, 1);
              }}
              className="relative z-[3] flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white shadow-lg shadow-teal-900/20 transition-[transform,background-color] hover:bg-[var(--color-primary-hover)] active:scale-95"
              aria-label="В корзину"
            >
              <ShoppingCart size={20} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
