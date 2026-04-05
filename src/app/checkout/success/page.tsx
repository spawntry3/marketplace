import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function CheckoutSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="mx-auto max-w-lg rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-12 text-center shadow-xl shadow-[var(--color-ink)]/[0.04]">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={40} strokeWidth={2} />
        </span>
        <h1 className="mt-6 text-2xl font-bold text-[var(--color-ink)]">
          Заказ оформлен
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
          Спасибо за покупку. Это демонстрация: платёж не проводился, данные
          карты никуда не отправлялись. В реальном магазине здесь был бы номер
          заказа и ссылка на отслеживание.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex w-full justify-center rounded-2xl bg-[var(--color-primary)] py-3.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
        >
          Вернуться в каталог
        </Link>
        <Link
          href="/cart"
          className="mt-3 inline-flex w-full justify-center rounded-2xl border border-[var(--color-border)] py-3 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-canvas)]"
        >
          Корзина
        </Link>
      </div>
    </div>
  );
}
