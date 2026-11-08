'use client'

import { Check } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type IconOption<V extends string> = { value: V; label: string; icon: ReactNode }

type IconRadioGroupProps<V extends string> = {
  legend: string
  options: readonly IconOption<V>[]
  value: V | null
  onChange: (value: V | null) => void
  className?: string
}

/** Icon cards for short scales (energy, mode, time). Tapping the selected card clears it. */
export function IconRadioGroup<V extends string>({
  legend,
  options,
  value,
  onChange,
  className,
}: IconRadioGroupProps<V>) {
  const name = useId()
  return (
    <fieldset className={cn('min-w-0', className)}>
      <legend className="mb-2.5 font-bold">{legend}</legend>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${Math.min(options.length, 3)}, minmax(0, 1fr))` }}
      >
        {options.map((option) => {
          const checked = option.value === value
          return (
            <label
              key={option.value}
              className={cn(
                'group relative grid min-h-11 cursor-pointer justify-items-center gap-1.5 rounded-md border px-1.5 pt-3.5 pb-3 text-center text-[0.9375rem]',
                'border-line-strong bg-card text-ink transition-colors duration-150 hover:border-ink-3',
                'has-checked:border-accent has-checked:bg-accent-soft has-checked:font-bold has-checked:text-accent-strong',
                'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent',
              )}
            >
              <input
                type="radio"
                className="sr-only"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                onClick={() => {
                  if (checked) onChange(null)
                }}
              />
              <Check
                aria-hidden="true"
                className="absolute top-2 right-2 hidden size-4 stroke-[2.5] group-has-checked:block"
              />
              <span aria-hidden="true" className="[&>svg]:size-6 [&>svg]:stroke-[1.75]">
                {option.icon}
              </span>
              <span>{option.label}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
