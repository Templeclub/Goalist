import { cn } from '@/lib/cn'

/** Shared chip look. Selected state is driven by a nested :checked input or aria-pressed. */
export const chipBase = cn(
  'group inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border-2 px-4 font-bold select-none',
  'border-line-strong bg-card text-[0.9375rem] text-ink transition-[color,background-color,box-shadow] duration-150',
  'hover:border-ink-3',
  'has-checked:border-outline has-checked:bg-accent has-checked:text-ink-on-accent has-checked:shadow-card',
  'aria-pressed:border-outline aria-pressed:bg-accent aria-pressed:text-ink-on-accent aria-pressed:shadow-card',
  'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
  'has-disabled:cursor-not-allowed has-disabled:opacity-50',
)

export const chipCheck =
  'hidden size-4 shrink-0 stroke-[2.5] group-has-checked:block group-aria-pressed:block'
