import type { CareLevel, PrepStatus } from '../types'
import { careLevelLabel } from '../data/animals'

export function Tag({ children, tone = 'sage' }: { children: React.ReactNode; tone?: 'sage' | 'brand' | 'info' }) {
  const tones = {
    sage: 'bg-sage-light text-sage-dark',
    brand: 'bg-brand-light text-brand-dark',
    info: 'bg-info-light text-ink-soft',
  }
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-sm ${tones[tone]}`}>{children}</span>
  )
}

export function CareLevelBadge({ level }: { level: CareLevel }) {
  const tone =
    level === 'easy'
      ? 'bg-sage-light text-sage-dark'
      : level === 'patient'
        ? 'bg-brand-light text-brand-dark'
        : 'bg-info-light text-ink-soft'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium ${tone}`}>
      <span aria-hidden="true">{level === 'easy' ? '◎' : level === 'patient' ? '◐' : '✚'}</span>
      {careLevelLabel[level]}
    </span>
  )
}

const statusMap: Record<string, { label: string; cls: string }> = {
  received: { label: '已收到', cls: 'bg-info-light text-ink-soft' },
  reviewing: { label: '確認中', cls: 'bg-brand-light text-brand-dark' },
  'need-more': { label: '需要補充', cls: 'bg-danger-light text-danger' },
  ready: { label: '可進入下一步', cls: 'bg-sage-light text-sage-dark' },
}

export function StatusBadge({ status }: { status: keyof typeof statusMap }) {
  const s = statusMap[status]
  return <span className={`inline-block rounded-full px-3 py-0.5 text-sm font-medium ${s.cls}`}>{s.label}</span>
}

export function PrepStatusBadge({ status }: { status: PrepStatus }) {
  const map: Record<PrepStatus, { label: string; cls: string }> = {
    todo: { label: '待準備', cls: 'bg-cream-dark text-ink-soft' },
    'in-progress': { label: '進行中', cls: 'bg-brand-light text-brand-dark' },
    done: { label: '已完成', cls: 'bg-sage-light text-sage-dark' },
  }
  const s = map[status]
  return <span className={`inline-block rounded-full px-3 py-0.5 text-sm font-medium ${s.cls}`}>{s.label}</span>
}
