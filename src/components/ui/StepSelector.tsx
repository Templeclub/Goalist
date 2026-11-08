'use client'

import { useId } from 'react'
import { cn } from '@/lib/cn'

export type Step<V extends string | number> = { value: V; label: string; description?: string }

type StepSelectorProps<V extends string | number> = {
  legend: string
  steps: readonly Step<V>[]
  value: V | null
  onChange: (value: V | null) => void
  className?: string
}

/**
 * Stepped scale with a label under each stop (difficulty, preparation…).
 * Native radios; tapping the selected stop clears it.
 */
export function StepSelector<V extends string | number>({
  legend,
  steps,
  value,
  onChange,
  className,
}: StepSelectorProps<V>) {
  const name = useId()
  const selected = steps.find((s) => s.value === value)

  return (
    <fieldset className={cn('min-w-0', className)}>
      <legend className="mb-2.5 font-bold">{legend}</legend>
      <div
        className="relative grid"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      >
        <span
          aria-hidden="true"
          className="absolute top-[1.3125rem] h-0.5 bg-line-strong"
          style={{ left: `${50 / steps.length}%`, right: `${50 / steps.length}%` }}
        />
        {steps.map((step) => {
          const checked = step.value === value
          return (
            <label
              key={String(step.value)}
              className="relative grid min-h-11 cursor-pointer justify-items-center gap-1.5 pt-2.5 text-center"
            >
              <input
                type="radio"
                className="peer sr-only"
                name={name}
                value={String(step.value)}
                checked={checked}
                onChange={() => onChange(step.value)}
                onClick={() => {
                  if (checked) onChange(null)
                }}
              />
              <span
                aria-hidden="true"
                className={cn(
                  'size-[1.375rem] rounded-full border-2 border-line-strong bg-paper transition-[background-color,box-shadow] duration-150',
                  'peer-checked:border-accent peer-checked:bg-accent peer-checked:shadow-[0_0_0_5px_var(--accent-soft)]',
                  'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-accent',
                )}
              />
              <span className="text-xs leading-tight text-ink-3 peer-checked:font-bold peer-checked:text-ink">
                {step.label}
              </span>
            </label>
          )
        })}
      </div>
      <p
        aria-live="polite"
        className={cn(
          'mt-3 text-[0.9375rem] text-ink-2',
          selected?.description && 'rounded-[10px] bg-paper-2 px-3 py-2.5',
        )}
      >
        {selected?.description}
      </p>
    </fieldset>
  )
}
