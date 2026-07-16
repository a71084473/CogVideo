import { useMemo, useState } from 'react'
import { animals } from '../data/animals'
import { AnimalCard } from '../components/AnimalCard'
import { EmptyState, Section } from '../components/shared'
import { getFavorites, toggleFavorite } from '../lib/storage'

interface Filters {
  species: string
  beginner: boolean
  aloneLong: boolean
  activity: string
  affection: string
  multiPet: boolean
  kids: boolean
  medical: string
  budget: string
  space: string
  location: string
  pair: string
}

const initialFilters: Filters = {
  species: 'all',
  beginner: false,
  aloneLong: false,
  activity: 'all',
  affection: 'all',
  multiPet: false,
  kids: false,
  medical: 'all',
  budget: 'all',
  space: 'all',
  location: 'all',
  pair: 'all',
}

const locations = [...new Set(animals.map((a) => a.location))]

function Select({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-11 w-full rounded-lg border border-cream-dark bg-white px-3 py-2"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

function Check({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label htmlFor={id} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-cream-dark bg-white px-3 py-2 text-sm has-checked:border-brand has-checked:bg-brand-light">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-brand" />
      {label}
    </label>
  )
}

export default function Animals() {
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [layout, setLayout] = useState<'card' | 'list'>('card')
  const [favs, setFavs] = useState<string[]>(getFavorites)
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setFilters((f) => ({ ...f, [k]: v }))

  const result = useMemo(() => {
    return animals.filter((a) => {
      if (filters.species !== 'all' && a.species !== filters.species) return false
      if (filters.beginner && !a.beginnerFriendly) return false
      if (filters.aloneLong && a.aloneHours < 9) return false
      if (filters.activity !== 'all' && a.activityLevel !== Number(filters.activity)) return false
      if (filters.affection !== 'all' && a.affection < Number(filters.affection)) return false
      if (filters.multiPet && !a.okMultiPet) return false
      if (filters.kids && !a.okKids) return false
      if (filters.medical === 'none' && (a.needsMedicalCare || a.dailyMedication)) return false
      if (filters.medical === 'ok' && !(a.needsMedicalCare || a.dailyMedication)) return false
      if (filters.budget === 'low' && !a.monthlyCost.includes('1,')) return false
      if (filters.space !== 'all' && a.spaceNeed !== filters.space) return false
      if (filters.location !== 'all' && a.location !== filters.location) return false
      if (filters.pair === 'single' && a.mustAdoptInPair) return false
      if (filters.pair === 'pair' && !a.mustAdoptInPair) return false
      return true
    })
  }, [filters])

  return (
    <Section
      title="尋找適合的夥伴"
      subtitle="篩選條件以「生活適配」為主——因為適合,比可愛更能走得長遠。"
    >
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* 篩選器 */}
        <aside aria-label="篩選條件" className="space-y-4 self-start rounded-card border border-cream-dark bg-white p-4">
          <p className="font-bold">生活適配篩選</p>
          <Select id="f-species" label="物種" value={filters.species} onChange={(v) => set('species', v)}
            options={[{ value: 'all', label: '全部' }, { value: 'cat', label: '貓' }, { value: 'dog', label: '狗' }]} />
          <div className="space-y-2">
            <Check id="f-beginner" label="新手友善" checked={filters.beginner} onChange={(v) => set('beginner', v)} />
            <Check id="f-alone" label="可接受長時間獨處(9 小時以上)" checked={filters.aloneLong} onChange={(v) => set('aloneLong', v)} />
            <Check id="f-multipet" label="適合多寵家庭" checked={filters.multiPet} onChange={(v) => set('multiPet', v)} />
            <Check id="f-kids" label="適合有兒童的家庭" checked={filters.kids} onChange={(v) => set('kids', v)} />
          </div>
          <Select id="f-activity" label="活動量" value={filters.activity} onChange={(v) => set('activity', v)}
            options={[{ value: 'all', label: '不限' }, { value: '1', label: '低(安穩型)' }, { value: '2', label: '中' }, { value: '3', label: '高(活力型)' }]} />
          <Select id="f-affection" label="親人程度至少" value={filters.affection} onChange={(v) => set('affection', v)}
            options={[{ value: 'all', label: '不限' }, { value: '2', label: '中等以上' }, { value: '3', label: '非常親人' }]} />
          <Select id="f-medical" label="特殊醫療/每日餵藥" value={filters.medical} onChange={(v) => set('medical', v)}
            options={[{ value: 'all', label: '不限' }, { value: 'none', label: '目前不考慮' }, { value: 'ok', label: '我願意照顧' }]} />
          <Select id="f-budget" label="每月照護預算" value={filters.budget} onChange={(v) => set('budget', v)}
            options={[{ value: 'all', label: '不限' }, { value: 'low', label: 'NT$2,500 以內為主' }]} />
          <Select id="f-space" label="居住空間" value={filters.space} onChange={(v) => set('space', v)}
            options={[{ value: 'all', label: '不限' }, { value: '小套房可', label: '小套房可' }, { value: '需一般住家', label: '需一般住家' }, { value: '需較大空間', label: '需較大空間' }]} />
          <Select id="f-location" label="所在地區" value={filters.location} onChange={(v) => set('location', v)}
            options={[{ value: 'all', label: '全部地區' }, ...locations.map((l) => ({ value: l, label: l }))]} />
          <Select id="f-pair" label="單獨/成對認養" value={filters.pair} onChange={(v) => set('pair', v)}
            options={[{ value: 'all', label: '不限' }, { value: 'single', label: '可單獨認養' }, { value: 'pair', label: '需成對認養' }]} />
          <button
            type="button"
            onClick={() => setFilters(initialFilters)}
            className="min-h-11 w-full rounded-lg border border-cream-dark px-4 py-2 text-sm hover:bg-cream"
          >
            清除全部條件
          </button>
        </aside>

        {/* 結果 */}
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-ink-soft" role="status">
              找到 <span className="font-bold text-ink">{result.length}</span> 位等待中的夥伴
            </p>
            <div role="group" aria-label="檢視方式" className="flex rounded-lg border border-cream-dark bg-white p-1">
              <button type="button" onClick={() => setLayout('card')} aria-pressed={layout === 'card'}
                className={`min-h-9 rounded-md px-3 text-sm ${layout === 'card' ? 'bg-brand-light font-medium text-brand-dark' : 'text-ink-soft'}`}>
                卡片
              </button>
              <button type="button" onClick={() => setLayout('list')} aria-pressed={layout === 'list'}
                className={`min-h-9 rounded-md px-3 text-sm ${layout === 'list' ? 'bg-brand-light font-medium text-brand-dark' : 'text-ink-soft'}`}>
                列表
              </button>
            </div>
          </div>

          {result.length === 0 ? (
            <EmptyState
              title="目前沒有完全符合的夥伴"
              hint="試著放寬一兩個條件——例如活動量或地區。也可以先做適配測驗,有新夥伴符合你的生活時,我們會通知你。"
              action={{ label: '改用適配測驗找夥伴', to: '/quiz' }}
            />
          ) : (
            <div className={layout === 'card' ? 'grid gap-5 sm:grid-cols-2' : 'space-y-5'}>
              {result.map((a) => (
                <AnimalCard
                  key={a.id}
                  animal={a}
                  layout={layout}
                  isFavorite={favs.includes(a.id)}
                  onToggleFavorite={(id) => setFavs(toggleFavorite(id))}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}
