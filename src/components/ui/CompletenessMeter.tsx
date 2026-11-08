import { useTranslations } from 'next-intl'
import type { CompletenessLevel } from '@/features/goals/schema'
import { cn } from '@/lib/cn'

const filled: Record<CompletenessLevel, number> = { sketch: 1, on_track: 2, well_filled: 3 }

/** Qualitative, never a percentage, never red. The label is always visible. */
export function CompletenessMeter({
  level,
  className,
}: {
  level: CompletenessLevel
  className?: string
}) {
  const t = useTranslations('common.completeness')
  return (
    <p className={cn('flex items-center gap-1 text-sm text-ink-2', className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className={cn('h-1.5 w-5.5 rounded-full', i < filled[level] ? 'bg-accent' : 'bg-line')}
        />
      ))}
      <span className="sr-only">{t('label')}</span>
      <b className="ml-2 font-semibold">{t(level)}</b>
    </p>
  )
}
