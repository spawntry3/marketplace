export const categoryVisual: Record<
  string,
  { emoji: string; gradient: string; label: string }
> = {
  GPU: {
    emoji: '🎮',
    gradient: 'from-violet-500/20 via-fuchsia-500/15 to-transparent',
    label: 'GPU',
  },
  CPU: {
    emoji: '⚡',
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    label: 'CPU',
  },
  RAM: {
    emoji: '🧠',
    gradient: 'from-sky-500/20 via-blue-500/10 to-transparent',
    label: 'RAM',
  },
  SSD: {
    emoji: '💾',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    label: 'SSD',
  },
  Monitor: {
    emoji: '🖥️',
    gradient: 'from-slate-500/20 via-zinc-500/10 to-transparent',
    label: 'Монитор',
  },
};

export const defaultProductVisual = {
  emoji: '💻',
  gradient: 'from-[var(--color-primary)]/25 via-teal-600/10 to-transparent',
  label: 'Комплектующие',
};

export function getProductVisual(category?: string | null) {
  const cat = category ?? '';
  return categoryVisual[cat] ?? defaultProductVisual;
}
