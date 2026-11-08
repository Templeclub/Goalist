import { useTranslations } from 'next-intl'
import { statusTone } from '@/features/goals/palette'
import type { GoalStatus } from '@/features/goals/schema'
import { cn } from '@/lib/cn'
import { statusIcon } from './icons'
import { toneProps } from './tone'

/** Calm status pill. "Réalisé" and "Lâché consciemment" carry the same visual weight. */
export function StatusPill({ status, className }: { status: GoalStatus; className?: string }) {
  const t = useTranslations('goal.statuses')
  const Icon = statusIcon[status]
  const tone = statusTone[status]
  return (
    <span
      {...toneProps(tone === 'accent' ? 'accent' : { status: tone })}
      className={cn(
        'inline-flex min-h-7 items-center gap-1.5 rounded-full bg-tone-bg px-2.5 py-0.5 text-sm leading-tight font-semibold text-tone-fg',
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-4 shrink-0 stroke-[1.75]" />
      {t(status)}
    </span>
  )
}
