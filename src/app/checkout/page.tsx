'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronRight,
  CreditCard,
  Lock,
  MapPin,
  User,
} from 'lucide-react';
import api from '@/lib/api';
import type { Product } from '@/types/product';
import { cn } from '@/lib/utils';
import { useMarketplace } from '@/providers/MarketplaceProvider';

function formatCardDigits(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 16);
  return d.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function formatExpiry(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}`;
}

const inputClass =
  'mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-[border-color,box-shadow] placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)]/50 focus:ring-2 focus:ring-[var(--color-primary)]/15';

const labelClass = 'text-sm font-medium text-[var(--color-ink)]';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, hydrated } = useMarketplace();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholder, setCardholder] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get<Product[]>('/products');
      return res.data;
    },
  });

  const entries = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({ id: Number(id), qty }))
        .filter((e) => e.qty > 0 && Number.isFinite(e.id)),
    [cart],
  );

  const byId = useMemo(
    () => new Map(products?.map((p) => [p.id, p]) ?? []),
    [products],
  );

  const lines = useMemo(() => {
    return entries
      .map(({ id, qty }) => {
        const p = byId.get(id);
        return p ? { product: p, qty } : null;
      })
      .filter(Boolean) as { product: Product; qty: number }[];
  }, [entries, byId]);

  const subtotal = useMemo(
    () =>
      lines.reduce((sum, { product, qty }) => {
        const effective = Math.min(qty, Math.max(0, product.stock));
        return sum + Number(product.price) * effective;
      }, 0),
    [lines],
  );

  useEffect(() => {
    if (!hydrated) return;
    if (entries.length === 0) {
      router.replace('/cart');
    }
  }, [hydrated, entries.length, router]);

  function validate() {
    const e: Record<string, string> = {};
    if (fullName.trim().length < 3) e.fullName = 'Укажите ФИО полностью';
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) e.phone = 'Введите корректный телефон';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      e.email = 'Некорректный email';
    }
    if (city.trim().length < 2) e.city = 'Укажите город';
    if (address.trim().length < 5) e.address = 'Укажите адрес доставки';

    const digits = cardNumber.replace(/\s/g, '');
    if (digits.length !== 16) e.cardNumber = 'Номер карты — 16 цифр';
    const exp = expiry.replace(/\D/g, '');
    if (exp.length !== 4) e.expiry = 'Срок MM/ГГ';
    else {
      const mm = Number(exp.slice(0, 2));
      if (mm < 1 || mm > 12) e.expiry = 'Некорректный месяц';
    }
    if (cvv.replace(/\D/g, '').length < 3) e.cvv = 'CVV/CVC — 3–4 цифры';
    if (cardholder.trim().length < 3) {
      e.cardholder = 'Как на карте (латиницей)';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    clearCart();
    router.push('/checkout/success');
  }

  if (!hydrated || isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-[var(--color-border)]" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="h-96 animate-pulse rounded-[2rem] bg-[var(--color-border)]/70" />
          <div className="h-64 animate-pulse rounded-[2rem] bg-[var(--color-border)]/70" />
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return null;
  }

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
        <Link href="/cart" className="hover:text-[var(--color-primary)]">
          Корзина
        </Link>
        <ChevronRight size={14} className="shrink-0 opacity-60" />
        <span className="text-[var(--color-ink)]">Оформление</span>
      </nav>

      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)] md:text-3xl">
            Оформление заказа
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Получатель, доставка и оплата банковской картой
          </p>
        </div>
        <div className="flex gap-2 text-xs text-[var(--color-muted)]">
          <span className="rounded-full bg-[var(--color-canvas)] px-3 py-1 font-medium">
            1. Данные
          </span>
          <span className="rounded-full bg-[var(--color-primary)]/15 px-3 py-1 font-medium text-[var(--color-primary)]">
            2. Карта
          </span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start"
      >
        <div className="order-2 space-y-8 lg:order-1">
          <section className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-canvas)] text-[var(--color-primary)]">
                <User size={22} strokeWidth={2} />
              </span>
              <div>
                <h2 className="font-bold text-[var(--color-ink)]">
                  Получатель и доставка
                </h2>
                <p className="text-xs text-[var(--color-muted)]">
                  Куда связаться и куда привезти заказ
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="co-name">
                  ФИО <span className="text-red-500">*</span>
                </label>
                <input
                  id="co-name"
                  name="fullName"
                  className={inputClass}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="example"
                  autoComplete="name"
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
                )}
              </div>
              <div>
                <label className={labelClass} htmlFor="co-phone">
                  Телефон <span className="text-red-500">*</span>
                </label>
                <input
                  id="co-phone"
                  name="phone"
                  className={inputClass}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 700 123 45 67"
                  autoComplete="tel"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>
              <div>
                <label className={labelClass} htmlFor="co-email">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="co-email"
                  name="email"
                  type="email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>
              <div>
                <label className={labelClass} htmlFor="co-city">
                  Город <span className="text-red-500">*</span>
                </label>
                <input
                  id="co-city"
                  name="city"
                  className={inputClass}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Алматы"
                  autoComplete="address-level2"
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-red-600">{errors.city}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="co-address">
                  Адрес доставки <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
                    size={18}
                  />
                  <input
                    id="co-address"
                    name="address"
                    className={cn(inputClass, 'pl-11')}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Улица, дом, квартира, подъезд, домофон"
                    autoComplete="street-address"
                  />
                </div>
                {errors.address && (
                  <p className="mt-1 text-xs text-red-600">{errors.address}</p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-canvas)] text-[var(--color-primary)]">
                <CreditCard size={22} strokeWidth={2} />
              </span>
              <div>
                <h2 className="font-bold text-[var(--color-ink)]">
                  Банковская карта
                </h2>
                <p className="text-xs text-[var(--color-muted)]">
                  Данные вводятся только в браузере (демо, без отправки на сервер)
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-canvas)]/50 p-4 text-xs leading-relaxed text-[var(--color-muted)]">
                <span className="inline-flex items-center gap-1.5 font-medium text-[var(--color-ink)]">
                  <Lock size={14} className="text-[var(--color-primary)]" />
                  Учебный интерфейс
                </span>
                <p className="mt-2">
                  В настоящем магазине оплату подключают через банк или Stripe —
                  номер карты и CVC никогда не хранят на своём сервере. Здесь форма
                  имитирует экран оплаты и не передаёт реквизиты в API.
                </p>
              </div>

              <div>
                <label className={labelClass} htmlFor="co-card">
                  Номер карты <span className="text-red-500">*</span>
                </label>
                <input
                  id="co-card"
                  name="ccnumber"
                  inputMode="numeric"
                  autoComplete="off"
                  className={cn(inputClass, 'font-mono tracking-wider')}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardDigits(e.target.value))}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                />
                {errors.cardNumber && (
                  <p className="mt-1 text-xs text-red-600">{errors.cardNumber}</p>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="co-exp">
                    Срок действия <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="co-exp"
                    name="cc-exp"
                    inputMode="numeric"
                    autoComplete="off"
                    className={cn(inputClass, 'font-mono')}
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="ММ / ГГ"
                    maxLength={5}
                  />
                  {errors.expiry && (
                    <p className="mt-1 text-xs text-red-600">{errors.expiry}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass} htmlFor="co-cvv">
                    CVV / CVC <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="co-cvv"
                    name="cvc"
                    inputMode="numeric"
                    autoComplete="off"
                    className={cn(inputClass, 'font-mono')}
                    value={cvv}
                    onChange={(e) =>
                      setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
                    }
                    placeholder="•••"
                    maxLength={4}
                  />
                  {errors.cvv && (
                    <p className="mt-1 text-xs text-red-600">{errors.cvv}</p>
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="co-holder">
                  Имя на карте (латиницей){' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="co-holder"
                  name="cc-name"
                  autoComplete="off"
                  className={inputClass}
                  value={cardholder}
                  onChange={(e) =>
                    setCardholder(e.target.value.toUpperCase().slice(0, 26))
                  }
                  placeholder="example"
                />
                {errors.cardholder && (
                  <p className="mt-1 text-xs text-red-600">{errors.cardholder}</p>
                )}
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end lg:hidden">
            <Link
              href="/cart"
              className="inline-flex justify-center rounded-2xl border border-[var(--color-border)] px-6 py-3.5 text-sm font-semibold text-[var(--color-ink)]"
            >
              Назад в корзину
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center rounded-2xl bg-[var(--color-primary)] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/15 disabled:opacity-60"
            >
              {submitting ? 'Обработка…' : 'Оплатить и завершить'}
            </button>
          </div>
        </div>

        <aside className="order-1 space-y-6 lg:order-2 lg:sticky lg:top-[8rem]">
          <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg shadow-[var(--color-ink)]/[0.03]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-muted)]">
              Ваш заказ
            </h2>
            <ul className="mt-4 max-h-56 space-y-3 overflow-y-auto text-sm">
              {lines.map(({ product, qty }) => {
                const effective = Math.min(qty, Math.max(0, product.stock));
                return (
                  <li
                    key={product.id}
                    className="flex justify-between gap-2 border-b border-[var(--color-border)]/60 pb-2 last:border-0"
                  >
                    <span className="line-clamp-2 text-[var(--color-ink)]">
                      {product.name}{' '}
                      <span className="text-[var(--color-muted)]">×{effective}</span>
                    </span>
                    <span className="shrink-0 font-medium tabular-nums text-[var(--color-ink)]">
                      {(Number(product.price) * effective).toLocaleString(
                        'kk-KZ',
                      )}{' '}
                      ₸
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 border-t border-[var(--color-border)] pt-4">
              <div className="flex justify-between text-sm text-[var(--color-muted)]">
                <span>Товары</span>
                <span className="tabular-nums">
                  {subtotal.toLocaleString('kk-KZ')} ₸
                </span>
              </div>
              <div className="mt-2 flex justify-between text-sm text-[var(--color-muted)]">
                <span>Доставка (демо)</span>
                <span>0 ₸</span>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="font-semibold text-[var(--color-ink)]">
                  К оплате
                </span>
                <span className="text-2xl font-bold tabular-nums text-[var(--color-ink)]">
                  {subtotal.toLocaleString('kk-KZ')} ₸
                </span>
              </div>
            </div>
          </div>

          <div className="hidden flex-col gap-3 lg:flex">
            <Link
              href="/cart"
              className="inline-flex justify-center rounded-2xl border border-[var(--color-border)] py-3.5 text-center text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-canvas)]"
            >
              Назад в корзину
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full justify-center rounded-2xl bg-[var(--color-ink)] py-3.5 text-sm font-semibold text-[var(--color-surface)] shadow-lg disabled:opacity-60"
            >
              {submitting ? 'Обработка…' : 'Оплатить и завершить'}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
