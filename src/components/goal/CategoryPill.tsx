import { useTranslations } from 'next-intl'
import { categoryHue } from '@/features/goals/palette'
import type { CategoryKey } from '@/features/goals/schema'
import { cn } from '@/lib/cn'
import { categoryIcon } from './icons'
import { toneProps } from './tone'

/** Category pill: hue + icon + label (never the colour alone). */
export function CategoryPill({
  category,
  className,
}: {
  category: CategoryKey
  className?: string
}) {
  const t = useTranslations('goal.categories')
  const Icon = categoryIcon[category]
  return (
    <span
      {...toneProps(categoryHue[category])}
      className={cn(
        'inline-flex min-h-7 items-center gap-1.5 rounded-full bg-tone-bg px-2.5 py-0.5 text-sm leading-tight font-semibold text-tone-fg',
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-4 shrink-0 stroke-[1.75]" />
      {t(category)}
    </span>
  )
}
