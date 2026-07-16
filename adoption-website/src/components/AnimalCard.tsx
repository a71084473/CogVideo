import { Link } from 'react-router-dom'
import type { Animal } from '../types'
import { AnimalPhoto } from './AnimalPhoto'
import { Tag, CareLevelBadge } from './Badges'

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
