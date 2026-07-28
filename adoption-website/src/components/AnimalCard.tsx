import { Link } from 'react-router-dom'
import type { Animal } from '../types'
import { AnimalPhoto } from './AnimalPhoto'
import { Tag, CareLevelBadge } from './Badges'
import { flags } from '../lib/canary'
import { useEffect } from 'react'
import { track } from '../lib/funnel'

export function AnimalCard({
  animal,
  isFavorite,
  onToggleFavorite,
  layout = 'card',
}: {
  animal: Animal
  isFavorite?: boolean
  onToggleFavorite?: (id: string) => void
  layout?: 'card' | 'list'
}) {
  // 曝光埋點:用來區分「久候動物看不到」與「看到但不敢認養」
  useEffect(() => {
    track('animal_impression', { animalId: animal.id, longWait: animal.waitingDays >= 120 })
  }, [animal.id, animal.waitingDays])

  return (
    <article
      className={`overflow-hidden rounded-card border border-cream-dark bg-white shadow-sm ${
        layout === 'list' ? 'flex flex-col sm:flex-row' : 'flex flex-col'
      }`}
    >
      <div className={layout === 'list' ? 'sm:w-64 sm:shrink-0' : ''}>
        <AnimalPhoto animal={animal} className={layout === 'list' ? 'h-full' : ''} />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold">
            {animal.name}
            <span className="ml-2 text-sm font-normal text-ink-soft">
              {animal.age}・{animal.sex}・{animal.location}
            </span>
          </h3>
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(animal.id)}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? `取消收藏${animal.name}` : `收藏${animal.name}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl hover:bg-cream"
            >
              <span aria-hidden="true" className={isFavorite ? 'text-brand' : 'text-ink-soft'}>
                {isFavorite ? '♥' : '♡'}
              </span>
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {animal.personalityTags.map((t) => (
            <Tag key={t} tone="brand">{t}</Tag>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {animal.lifestyleTags.map((t) => (
            <Tag key={t} tone="sage">{t}</Tag>
          ))}
          <CareLevelBadge level={animal.careLevel} />
        </div>
        <p className="text-sm text-ink-soft">
          <span className="font-medium text-ink">為什麼可能適合你:</span>
          {animal.whyMaybeFit}
        </p>
        {flags().waitingVisibility && animal.waitingDays >= 120 && (
          <p className="text-sm text-ink-soft">
            <span aria-hidden="true">◷</span> 已在中途之家等待 {animal.waitingDays} 天。
            性格穩定的成貓成犬常因為外型不搶眼而被略過,牠值得被多看一眼。
          </p>
        )}
        <div className="mt-auto pt-2">
          <Link
            to={`/animals/${animal.id}`}
            className="inline-flex min-h-11 items-center rounded-lg bg-sage px-4 py-2 font-medium text-white hover:bg-sage-dark"
          >
            了解{animal.name}的真實生活
          </Link>
        </div>
      </div>
    </article>
  )
}
