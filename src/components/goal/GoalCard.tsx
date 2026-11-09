import { Clock, Hourglass } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { categoryEmoji } from '@/features/goals/auto-classify'
import { needsEarlyStart } from '@/features/goals/priority'
import { categoryHue } from '@/features/goals/palette'
import type { CategoryKey, GoalStatus, Horizon } from '@/features/goals/schema'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { Skeleton } from '../ui/Skeleton'
import { CategoryPill } from './CategoryPill'
import { StatusPill } from './StatusPill'
import { toneProps } from './tone'

export type GoalCardData = {
  title: string
  emoji?: string | null
  /** System categories, in order. The first gives the ribbon its hue. */
  categories?: readonly CategoryKey[]
  /** A personal first category (label + hue), shown when there is no system one. */
  customCategory?: { label: string; hue: number | null } | null
  status?: GoalStatus | null
  horizon?: string | null
  preparation?: string | null
  /** Ribbon colour when no system category gives one (personal category, legacy colour). */
  hue?: number | null
}

type GoalCardProps = GoalCardData & {
  href?: string
  /** "large" on the home screen, "compact" in the list grid. */
  size?: 'large' | 'compact'
  /** Plays the gentle landing bounce (just kept). */
  justKept?: boolean
  headingLevel?: 'h2' | 'h3' | 'h4'
  className?: string
}

const badgeClass =
  'inline-flex min-h-7 max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-[0.8125rem] leading-tight font-semibold'

/**
 * The wish card: a notebook page with a bookmark ribbon in the category's hue, the
 * category, when it is for and whether it needs preparing early (D-061).
 */
export function GoalCard({
  title,
  emoji,
  categories = [],
  customCategory,
  status,
  horizon,
  preparation,
  hue: fallbackHue,
  href,
  size = 'large',
  justKept,
  headingLevel: Heading = 'h3',
  className,
}: GoalCardProps) {
  const t = useTranslations('goal.card')
  const tHorizon = useTranslations('goal.horizonShort')
  const first = categories[0]
  const hue = first ? categoryHue[first] : (customCategory?.hue ?? fallbackHue ?? null)
  const compact = size === 'compact'
  const shownEmoji = emoji ?? (first ? categoryEmoji[first] : null)
  const showStatus = status && status !== 'idea'
  const early = needsEarlyStart({ horizon, preparation, status })

  return (
    <article
      {...toneProps(hue)}
      className={cn(
        'relative grid content-start gap-1.5 rounded-card border border-card-border bg-card shadow-card',
        compact ? 'py-3.5 pr-9 pl-3.5' : 'py-4 pr-12 pl-4.5',
        'transition-shadow duration-150 has-[a:hover]:shadow-[0_1px_2px_rgb(0_0_0/0.06),0_12px_28px_-12px_rgb(70_45_25/0.3)]',
        'has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-accent',
        justKept && 'animate-land',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'signet absolute -top-1.5 rounded-t-[2px]',
          compact ? 'right-3 h-7 w-3' : 'right-4.5 h-9 w-4',
        )}
      />
      {shownEmoji && (
        <span aria-hidden="true" className={cn('leading-none', compact ? 'text-xl' : 'text-2xl')}>
          {shownEmoji}
        </span>
      )}
      <Heading
        className={cn(
          'font-display leading-tight font-medium tracking-[-0.005em] break-words',
          compact ? 'line-clamp-4 text-[1.0625rem]' : 'text-lg',
        )}
      >
        {href ? (
          <Link
            href={href}
            className="outline-none after:absolute after:inset-0 after:rounded-card"
          >
            {title || t('untitled')}
          </Link>
        ) : (
          title || t('untitled')
        )}
      </Heading>
      {(first || customCategory || horizon || early || showStatus) && (
        <div className="mt-1 flex min-w-0 flex-wrap gap-1.5">
          {first ? (
            <CategoryPill
              category={first}
              className={cn('max-w-full', compact && 'text-[0.8125rem]')}
            />
          ) : customCategory ? (
            <CategoryPill
              custom={customCategory}
              className={cn('max-w-full', compact && 'text-[0.8125rem]')}
            />
          ) : null}
          {horizon && (
            <span className={cn(badgeClass, 'border border-line-strong text-ink-2')}>
              <Clock aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="sr-only">{t('horizon')}</span>
              {tHorizon(horizon as Horizon)}
            </span>
          )}
          {early && (
            <span {...toneProps('accent')} className={cn(badgeClass, 'bg-tone-bg text-tone-fg')}>
              <Hourglass aria-hidden="true" className="size-3.5 shrink-0" />
              {t('prepareEarly')}
            </span>
          )}
          {showStatus && (
            <StatusPill
              status={status}
              className={cn('max-w-full', compact && 'text-[0.8125rem]')}
            />
          )}
        </div>
      )}
    </article>
  )
}

export function GoalCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'grid gap-2.5 rounded-card border border-card-border bg-card p-4 shadow-card',
        className,
      )}
    >
      <Skeleton className="size-6 rounded-full" />
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-4 w-3/5" />
      <div className="mt-1 flex gap-1.5">
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>
    </div>
  )
}
