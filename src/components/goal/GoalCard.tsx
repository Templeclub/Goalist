import { Clock, Hourglass } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import { categoryEmoji } from '@/features/goals/auto-classify'
import { categoryHue } from '@/features/goals/palette'
import { needsEarlyStart } from '@/features/goals/priority'
import { gemCount, rarityOf } from '@/features/goals/rarity'
import type { CategoryKey, CompletenessLevel, GoalStatus, Horizon } from '@/features/goals/schema'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { Skeleton } from '../ui/Skeleton'
import { StatusPill } from './StatusPill'
import { toneProps } from './tone'

export type GoalCardData = {
  title: string
  emoji?: string | null
  /** System categories, in order. The first gives the card its series and colour. */
  categories?: readonly CategoryKey[]
  /** A personal first category (label + hue), shown when there is no system one. */
  customCategory?: { label: string; hue: number | null } | null
  status?: GoalStatus | null
  horizon?: string | null
  preparation?: string | null
  budgetLevel?: string | null
  firstStep?: string | null
  completenessLevel?: CompletenessLevel | null
  /** Set once the card is acquired (status done): its number in the collection and date. */
  acquired?: { number: number; at: string } | null
  /** Colour when no category gives one (legacy wish colour). */
  hue?: number | null
}

type GoalCardProps = GoalCardData & {
  href?: string
  /** "compact" in grids, "large" on the home screen, "hero" on the card's own page. */
  size?: 'compact' | 'large' | 'hero'
  /** Plays the gentle landing bounce (just kept or just converted). */
  justKept?: boolean
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4'
  className?: string
}

const activeStatuses = new Set(['preparing', 'in_progress', 'paused'])

/**
 * A wish as a collectible card (D-062): its series (category) colours the frame and the art,
 * its rarity (preparation, budget, horizon) shows as gems. A sketch waits to be revealed;
 * a done wish is an acquired card, numbered in the collection; a let-go one is put away.
 */
export function GoalCard({
  title,
  emoji,
  categories = [],
  customCategory,
  status,
  horizon,
  preparation,
  budgetLevel,
  firstStep,
  completenessLevel,
  acquired,
  hue: fallbackHue,
  href,
  size = 'large',
  justKept,
  headingLevel: Heading = 'h3',
  className,
}: GoalCardProps) {
  const t = useTranslations('goal.card')
  const tGoal = useTranslations('goal')
  const format = useFormatter()
  const first = categories[0]
  const hue = first ? categoryHue[first] : (customCategory?.hue ?? fallbackHue ?? null)
  const isAcquired = status === 'done'
  const isStored = status === 'let_go'
  const isSketch = !isAcquired && !isStored && completenessLevel === 'sketch'
  const rarity = rarityOf({ preparation, budget_level: budgetLevel, horizon })
  const gems = gemCount(rarity)
  const series = first ? tGoal(`categories.${first}`) : (customCategory?.label ?? t('noSeries'))
  const shownEmoji = emoji ?? (first ? categoryEmoji[first] : '✨')
  const early = needsEarlyStart({ horizon, preparation, status })
  const compact = size === 'compact'
  const hero = size === 'hero'
  const titleNode = title || t('untitled')

  return (
    <article
      {...toneProps(hue)}
      data-state={isAcquired ? 'acquired' : isStored ? 'stored' : isSketch ? 'sketch' : 'active'}
      className={cn(
        'relative grid content-start rounded-card border-[3px] text-ink',
        isSketch ? 'border-dashed border-line-strong bg-card' : 'border-outline shadow-pop',
        isAcquired ? 'bg-acquired' : !isSketch && 'bg-tone-bg',
        isStored && 'opacity-80 saturate-50',
        compact ? 'gap-1.5 p-2.5' : hero ? 'gap-3 p-4' : 'gap-2 p-3',
        'transition-transform duration-150 has-[a:hover]:-translate-y-0.5',
        'has-[a:focus-visible]:outline-[3px] has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-accent',
        justKept && 'animate-land',
        className,
      )}
    >
      {isAcquired && (
        <span
          className={cn(
            'absolute -top-3 -right-2.5 z-10 rotate-6 rounded-full border-[2.5px] border-outline bg-gilt px-2.5 py-0.5 font-display font-extrabold text-on-gilt',
            compact ? 'text-xs' : 'text-sm',
          )}
        >
          {t('acquiredSticker')}
        </span>
      )}

      <div className="flex items-start justify-between gap-2">
        <Heading
          className={cn(
            'min-w-0 font-display leading-[1.05] font-extrabold break-words',
            compact ? 'line-clamp-3 text-[1.0625rem]' : hero ? 'text-3xl' : 'text-xl',
          )}
        >
          {href ? (
            <Link
              href={href}
              className="outline-none after:absolute after:inset-0 after:rounded-card"
            >
              {titleNode}
            </Link>
          ) : (
            titleNode
          )}
        </Heading>
        {!isSketch && (
          <span
            className="flex shrink-0 gap-0.5 pt-1.5 text-tone-fg"
            role="img"
            aria-label={t('rarityLabel', { rarity: tGoal(`rarity.${rarity}`) })}
          >
            {Array.from({ length: gems }, (_, i) => (
              <span
                key={i}
                className={cn(
                  'rotate-45 rounded-[2px] bg-current',
                  compact ? 'size-1.5' : 'size-2',
                )}
              />
            ))}
          </span>
        )}
      </div>

      <div
        aria-hidden="true"
        className={cn(
          'grid place-items-center rounded-[calc(var(--r-card)-6px)] border-[2.5px] leading-none',
          isSketch ? 'card-art-sketch border-line-strong' : 'border-outline',
          isAcquired ? 'holo' : !isSketch && 'bg-tone-ribbon',
          compact ? 'h-20 text-4xl' : hero ? 'h-44 text-7xl' : 'h-28 text-5xl',
        )}
      >
        <span className={cn(isSketch && 'opacity-60 grayscale')}>{shownEmoji}</span>
      </div>

      <p
        className={cn(
          'font-extrabold tracking-wide uppercase',
          compact ? 'text-[0.6875rem]' : 'text-xs',
        )}
      >
        {isSketch
          ? `${series} · ${t('sketch')}`
          : isStored
            ? `${series} · ${t('stored')}`
            : `${series} · ${tGoal(`rarity.${rarity}`)}`}
      </p>

      {!isSketch && !isAcquired && (horizon || (status && activeStatuses.has(status))) && (
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          {horizon && (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-bold text-ink-2',
                compact ? 'text-[0.75rem]' : 'text-sm',
              )}
            >
              <Clock aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="sr-only">{t('horizon')}</span>
              {tGoal(`horizonShort.${horizon as Horizon}`)}
            </span>
          )}
          {status && activeStatuses.has(status) && (
            <StatusPill status={status} className={cn(compact && 'min-h-6 text-[0.75rem]')} />
          )}
        </div>
      )}

      {isAcquired && acquired && (
        <p className={cn('font-extrabold text-ink-2', compact ? 'text-[0.75rem]' : 'text-sm')}>
          {t('acquiredOn', {
            number: String(acquired.number).padStart(3, '0'),
            date: format.dateTime(new Date(acquired.at), { dateStyle: 'medium' }),
          })}
        </p>
      )}

      {isSketch ? (
        href ? (
          <p
            className={cn(
              'mt-auto font-extrabold text-accent-strong',
              compact ? 'text-xs' : 'text-sm',
            )}
          >
            {t('reveal')}
          </p>
        ) : null
      ) : !isAcquired && !isStored && (early || firstStep) ? (
        <p
          className={cn(
            'mt-auto flex items-start gap-1 rounded-[10px] border-2 border-outline bg-card px-2 py-1 leading-snug font-bold',
            compact ? 'text-[0.75rem]' : 'text-sm',
          )}
        >
          {early ? (
            <>
              <Hourglass aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
              {t('prepareEarly')}
            </>
          ) : (
            <>
              <span aria-hidden="true">▶</span>
              <span className="sr-only">{t('firstStep')}</span>
              <span className={cn(compact && 'line-clamp-2')}>{firstStep}</span>
            </>
          )}
        </p>
      ) : null}
    </article>
  )
}

export function GoalCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'grid gap-2.5 rounded-card border-[3px] border-dashed border-line-strong bg-card p-3',
        className,
      )}
    >
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-20 w-full rounded-md" />
      <Skeleton className="h-4 w-3/5" />
      <Skeleton className="h-7 w-full rounded-md" />
    </div>
  )
}
