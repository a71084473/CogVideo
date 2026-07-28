import { Link } from 'react-router-dom'

export function Section({
  title,
  subtitle,
  children,
  className = '',
  level = 2,
}: {
  title?: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  /** 每頁的第一個 Section 用 1,讓頁面有唯一的主標題 */
  level?: 1 | 2
}) {
  const Heading = level === 1 ? 'h1' : 'h2'
  return (
    <section className={`mx-auto max-w-6xl px-4 py-10 ${className}`}>
      {title && <Heading className={level === 1 ? 'text-3xl font-bold' : 'text-2xl font-bold'}>{title}</Heading>}
      {subtitle && <p className="mt-1 max-w-2xl text-ink-soft">{subtitle}</p>}
      <div className={title ? 'mt-6' : ''}>{children}</div>
    </section>
  )
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm text-ink-soft">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="h-2.5 overflow-hidden rounded-full bg-cream-dark"
      >
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string
  hint: string
  action?: { label: string; to: string }
}) {
  return (
    <div className="rounded-card border border-dashed border-sage/50 bg-white px-6 py-12 text-center">
      <p aria-hidden="true" className="text-3xl">☘</p>
      <p className="mt-2 text-lg font-medium">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-ink-soft">{hint}</p>
      {action && (
        <Link
          to={action.to}
          className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-brand px-5 py-2.5 font-medium text-white hover:bg-brand-dark"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}

export function WhyWeAsk({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 rounded-lg bg-info-light px-3 py-2 text-sm text-ink-soft">
      <span className="font-medium text-ink">為什麼要問這題?</span> {children}
    </div>
  )
}

export function HelpEntry() {
  return (
    <div className="rounded-card border border-sage/40 bg-sage-light/60 p-5">
      <p className="font-bold">我需要協助</p>
      <p className="mt-1 text-sm text-ink-soft">
        遇到問題不代表你不適合。越早告訴我們,越容易一起找到方法。
      </p>
      <Link
        to="/crisis"
        className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-sage px-5 py-2.5 font-medium text-white hover:bg-sage-dark"
      >
        取得協助
      </Link>
    </div>
  )
}
