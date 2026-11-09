import { Hourglass, Shapes } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import { categoryEmoji } from '@/features/goals/auto-classify'
import { categoryHue } from '@/features/goals/palette'
import { needsEarlyStart } from '@/features/goals/priority'
import { pathSteps, stepIndex } from '@/features/goals/progress'
import { gemCount, levelOf, rarityOf, statShare } from '@/features/goals/rarity'
import type { CategoryKey, CompletenessLevel, GoalStatus, Horizon } from '@/features/goals/schema'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { Skeleton } from '../ui/Skeleton'
import { CardTilt } from './CardTilt'
import { categoryIcon } from './icons'
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
  /** Used by the conversion flip on the card's own page. */
  id?: string
  href?: string
  /** "compact" in grids, "large" on the home screen, "hero" on the card's own page. */
  size?: 'compact' | 'large' | 'hero'
  /** Plays the gentle landing bounce (just kept or just converted). */
  justKept?: boolean
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4'
  className?: string
}

/**
 * A wish as an « Arcade Pro » collectible card (D-062, D-063): a frame in its series colour,
 * title and level, a series medallion, rarity gems, three stats and its place on the path.
 * The same anatomy at every size; only the scale changes. Acquired cards turn holographic.
 */
export function GoalCard({
  id,
  title,
  emoji,
  categories = [],
  customCategory,
  status,
  horizon,
  preparation,
  budgetLevel,
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
  const facts = { preparation, budget_level: budgetLevel, horizon }
  const rarity = rarityOf(facts)
  const level = levelOf(facts)
  const series = first ? tGoal(`categories.${first}`) : (customCategory?.label ?? t('noSeries'))
  const SeriesIcon = first ? categoryIcon[first] : Shapes
  const shownEmoji = emoji ?? (first ? categoryEmoji[first] : '✨')
  const early = needsEarlyStart({ horizon, preparation, status })
  const step = status ? stepIndex(status) : 0
  const compact = size === 'compact'
  const hero = size === 'hero'
  const titleNode = title || t('untitled')
  const small = compact ? 'text-[0.6875rem]' : hero ? 'text-sm' : 'text-xs'

  const stat = (label: string, share: number, value: string | null) => (
    <>
      <dt className="font-extrabold">{label}</dt>
      <dd className="flex items-center">
        <span
          aria-hidden="true"
          className="h-1.5 w-full overflow-hidden rounded-full bg-paper-2 ring-1 ring-outline/30"
        >
          <span className="block h-full rounded-full bg-ink" style={{ width: `${share * 100}%` }} />
        </span>
        <span className="sr-only">{value ?? t('unknown')}</span>
      </dd>
    </>
  )

  return (
    <CardTilt
      {...toneProps(hue)}
      data-card-id={id}
      data-size={size}
      data-state={isAcquired ? 'acquired' : isStored ? 'stored' : isSketch ? 'sketch' : 'active'}
      className={cn(
        'card-tilt relative grid min-w-0 rounded-card border-[3px] text-ink',
        isSketch
          ? 'border-dashed border-line-strong bg-card'
          : cn('border-outline shadow-pop', isAcquired ? 'holo' : 'bg-tone-ribbon'),
        isStored && 'opacity-80 saturate-50',
        compact ? 'p-1' : 'p-1.5',
        'has-[a:focus-visible]:outline-[3px] has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-accent',
        justKept && 'animate-land',
        className,
      )}
    >
      <div
        className={cn(
          'relative flex min-w-0 flex-col rounded-[calc(var(--r-card)-5px)] bg-card',
          !isSketch && 'border-2 border-outline',
          compact ? 'gap-1 p-1.5' : hero ? 'gap-2.5 p-3' : 'gap-1.5 p-2',
        )}
      >
        <div className="flex items-start justify-between gap-1.5">
          <Heading
            className={cn(
              'min-w-0 font-display leading-[1.02] font-extrabold break-words',
              compact ? 'line-clamp-3 text-[0.9375rem]' : hero ? 'text-3xl' : 'text-lg',
            )}
          >
            {href ? (
              <Link
                href={href}
                className="outline-none after:absolute after:inset-0 after:z-10 after:rounded-card"
              >
                {titleNode}
              </Link>
            ) : (
              titleNode
            )}
          </Heading>
          {!isSketch && (
            <span
              className={cn(
                'shrink-0 rounded-full border-2 border-outline bg-gilt px-1.5 font-display leading-tight font-extrabold whitespace-nowrap text-on-gilt',
                compact ? 'text-[0.6875rem]' : hero ? 'px-2.5 text-base' : 'text-xs',
              )}
            >
              {t('level', { level })}
            </span>
          )}
        </div>

        <div
          aria-hidden="true"
          className={cn(
            'relative grid place-items-center rounded-[10px] border-2 leading-none',
            isSketch
              ? 'card-art-sketch border-line-strong'
              : isAcquired
                ? 'holo border-outline'
                : 'card-halftone border-outline bg-tone-ribbon',
            compact ? 'h-[4.5rem] text-4xl' : hero ? 'h-40 text-7xl' : 'h-24 text-5xl',
          )}
        >
          <span className={cn(isSketch && 'opacity-60 grayscale')}>{shownEmoji}</span>
          <span
            className={cn(
              'absolute -bottom-2.5 -left-1.5 grid place-items-center rounded-full border-2 border-outline bg-card text-ink',
              compact ? 'size-6' : hero ? 'size-9' : 'size-7',
            )}
          >
            <SeriesIcon className={cn('stroke-[2.25]', compact ? 'size-3.5' : 'size-4.5')} />
          </span>
        </div>

        <p
          className={cn(
            'flex items-center justify-between gap-1 pl-5 font-extrabold tracking-wide uppercase',
            compact
              ? 'mt-0.5 text-[0.625rem]'
              : hero
                ? 'mt-1 pl-8 text-sm'
                : 'mt-1 pl-6 text-[0.6875rem]',
          )}
        >
          <span className="line-clamp-2 min-w-0">
            {isSketch
              ? `${series} · ${t('sketch')}`
              : isStored
                ? `${series} · ${t('stored')}`
                : `${series} · ${tGoal(`rarity.${rarity}`)}`}
          </span>
          {!isSketch && (
            <span
              role="img"
              aria-label={t('rarityLabel', { rarity: tGoal(`rarity.${rarity}`) })}
              className="flex shrink-0 gap-0.5 text-tone-fg"
            >
              {Array.from({ length: gemCount(rarity) }, (_, i) => (
                <span key={i} className="size-1.5 rotate-45 rounded-[1px] bg-current" />
              ))}
            </span>
          )}
        </p>

        {!isSketch && (
          <dl
            className={cn(
              'grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-0.5 text-ink-2',
              small,
            )}
          >
            {stat(
              t('stats.preparation'),
              statShare('preparation', preparation),
              preparation ? tGoal(`preparation.${preparation as 'none'}`) : null,
            )}
            {stat(
              t('stats.budget'),
              statShare('budget', budgetLevel),
              budgetLevel ? tGoal(`budget.${budgetLevel as 'none'}`) : null,
            )}
            <dt className="font-extrabold">{t('stats.horizon')}</dt>
            <dd className="truncate font-extrabold text-ink">
              {horizon ? tGoal(`horizonShort.${horizon as Horizon}`) : '—'}
            </dd>
          </dl>
        )}

        <div
          className={cn(
            'mt-auto rounded-[8px] border-2 border-outline px-1.5 py-0.5 font-extrabold',
            small,
            isAcquired ? 'bg-gilt text-on-gilt' : 'bg-card',
            isSketch && 'border-dashed border-line-strong text-accent-strong',
          )}
        >
          {isSketch ? (
            t('reveal')
          ) : isAcquired && acquired ? (
            <span className="flex justify-between gap-1">
              <span>
                {t('acquiredNumber', { number: String(acquired.number).padStart(3, '0') })}
              </span>
              <span className="truncate">
                {format.dateTime(new Date(acquired.at), { dateStyle: 'medium' })}
              </span>
            </span>
          ) : isAcquired ? (
            t('acquiredSticker')
          ) : isStored ? (
            t('stored')
          ) : early && (step ?? 0) < 2 ? (
            <span className="flex items-center gap-1">
              <Hourglass aria-hidden="true" className="size-3 shrink-0" />
              {t('prepareEarly')}
            </span>
          ) : (
            <span className="flex items-center justify-between gap-1">
              <span aria-hidden="true" className="flex gap-0.5">
                {pathSteps.slice(0, 4).map((s, i) => (
                  <span
                    key={s}
                    className={cn(
                      'size-1.5 rounded-full border border-outline',
                      step !== null && i <= step ? 'bg-ink' : 'bg-transparent',
                    )}
                  />
                ))}
              </span>
              <span className="truncate">{status ? tGoal(`statuses.${status}`) : ''}</span>
            </span>
          )}
        </div>
      </div>

      {isAcquired && (
        <span
          aria-hidden="true"
          className="holo-sheen pointer-events-none absolute inset-0 rounded-[inherit]"
        />
      )}
    </CardTilt>
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
