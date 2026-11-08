import { useTranslations } from 'next-intl'
import { categoryHue } from '@/features/goals/palette'
import type { CategoryKey, GoalStatus } from '@/features/goals/schema'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { Skeleton } from '../ui/Skeleton'
import { CategoryPill } from './CategoryPill'
import { StatusPill } from './StatusPill'
import { toneProps } from './tone'

export type GoalCardData = {
  title: string
  tagline?: string | null
  emoji?: string | null
  categories?: readonly CategoryKey[]
  status?: GoalStatus | null
}

type GoalCardProps = GoalCardData & {
  href?: string
  /** "large" on the home screen, "compact" in lists. */
  size?: 'large' | 'compact'
  /** Plays the gentle landing bounce (just kept). */
  justKept?: boolean
  headingLevel?: 'h2' | 'h3' | 'h4'
  className?: string
}

/** The wish card: a notebook page with a bookmark ribbon in the first category's hue. */
export function GoalCard({
  title,
  tagline,
  emoji,
  categories = [],
  status,
  href,
  size = 'large',
  justKept,
  headingLevel: Heading = 'h3',
  className,
}: GoalCardProps) {
  const t = useTranslations('goal.card')
  const first = categories[0]
  const hue = first ? categoryHue[first] : null

  return (
    <article
      {...toneProps(hue)}
      className={cn(
        'relative grid gap-1.5 rounded-card border border-card-border bg-card py-4 pr-12 pl-4.5 shadow-card',
        'transition-shadow duration-150 has-[a:hover]:shadow-[0_1px_2px_rgb(0_0_0/0.06),0_12px_28px_-12px_rgb(70_45_25/0.3)]',
        'has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-accent',
        justKept && 'animate-land',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="signet absolute -top-1.5 right-4.5 h-9 w-4 rounded-t-[2px]"
      />
      {emoji && (
        <span
          aria-hidden="true"
          className={cn('leading-none', size === 'large' ? 'text-2xl' : 'text-xl')}
        >
          {emoji}
        </span>
      )}
      <Heading
        className={cn(
          'font-display leading-tight font-medium tracking-[-0.005em]',
          size === 'large' ? 'text-lg' : 'text-md',
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
      {tagline && <p className="text-[0.9375rem] leading-snug text-ink-2">{tagline}</p>}
      {(first || status) && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {first && <CategoryPill category={first} />}
          {status && <StatusPill status={status} />}
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
        'grid gap-2.5 rounded-card border border-card-border bg-card p-4.5 shadow-card',
        className,
      )}
    >
      <Skeleton className="size-6 rounded-full" />
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-4 w-3/5" />
      <div className="mt-1 flex gap-1.5">
        <Skeleton className="h-7 w-28 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
    </div>
  )
}
