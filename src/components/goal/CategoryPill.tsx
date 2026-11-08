import { Shapes } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { categoryHue } from '@/features/goals/palette'
import type { CategoryKey } from '@/features/goals/schema'
import { cn } from '@/lib/cn'
import { categoryIcon } from './icons'
import { toneProps } from './tone'

type CategoryPillProps =
  | { category: CategoryKey; custom?: never; className?: string }
  | { category?: never; custom: { label: string; hue: number | null }; className?: string }

/** Category pill: hue + icon + label (never the colour alone). System or personal category. */
export function CategoryPill({ category, custom, className }: CategoryPillProps) {
  const t = useTranslations('goal.categories')
  const Icon = category ? categoryIcon[category] : Shapes
  const hue = category ? categoryHue[category] : (custom?.hue ?? null)
  return (
    <span
      {...toneProps(hue)}
      className={cn(
        'inline-flex min-h-7 items-center gap-1.5 rounded-full bg-tone-bg px-2.5 py-0.5 text-sm leading-tight font-semibold text-tone-fg',
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-4 shrink-0 stroke-[1.75]" />
      {category ? t(category) : custom?.label}
    </span>
  )
}
