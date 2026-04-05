import Link from 'next/link';
import { Cpu, Headphones, ShieldCheck, Truck } from 'lucide-react';

const footerLinks = {
  Покупателям: [
    { label: 'Доставка', href: '#' },
    { label: 'Оплата', href: '#' },
    { label: 'Возврат', href: '#' },
  ],
  Компания: [
    { label: 'О нас', href: '#' },
    { label: 'Контакты', href: '#' },
    { label: 'Вакансии', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/40 to-transparent" />
      <div className="container mx-auto px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="inline-block text-xl font-bold tracking-tight text-[var(--color-ink)]"
            >
              Qaz<span className="text-[var(--color-primary)]">Market</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--color-muted)]">
              Маркетплейс IT-комплектующих: видеокарты, процессоры, память и
              периферия с доставкой по Казахстану.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                {title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {links.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-[var(--color-ink)]/85 transition-colors hover:text-[var(--color-primary)]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              Почему мы
            </h3>
            <ul className="mt-4 space-y-3">
              {[
                { icon: Truck, text: 'Быстрая доставка' },
                { icon: ShieldCheck, text: 'Гарантия подлинности' },
                { icon: Headphones, text: 'Поддержка 7/7' },
                { icon: Cpu, text: 'Проверенные бренды' },
              ].map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-2.5 text-sm text-[var(--color-ink)]/85"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-canvas)] text-[var(--color-primary)]">
                    <Icon size={16} strokeWidth={2} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--color-border)] pt-8 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-[var(--color-muted)]">
            © {new Date().getFullYear()} QazMarket. Все права защищены.
          </p>
          <p className="text-xs text-[var(--color-muted)]/80">
            Цены в тенге (₸). Актуальность уточняйте при оформлении.
          </p>
        </div>
      </div>
    </footer>
  );
}
