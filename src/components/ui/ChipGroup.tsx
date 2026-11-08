'use client'

import { Check } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { chipBase, chipCheck } from './chip-styles'

export type ChipOption<V extends string> = {
  value: V
  label: string
  icon?: ReactNode
  disabled?: boolean
  /** Short extra text, e.g. "Bientôt". */
  note?: string
}

type Common<V extends string> = {
  legend: string
  /** Visually hide the legend when a heading already labels the group. */
  hideLegend?: boolean
  description?: string
  options: readonly ChipOption<V>[]
  className?: string
}

type Single<V extends string> = Common<V> & {
  type: 'single'
  value: V | null
  /** Every qualification is optional: tapping the selected chip clears it. */
  onChange: (value: V | null) => void
}

type Multiple<V extends string> = Common<V> & {
  type: 'multiple'
  value: readonly V[]
  onChange: (value: V[]) => void
}

export type ChipGroupProps<V extends string> = Single<V> | Multiple<V>

/**
 * Single or multiple choice built on native radios / checkboxes, so keyboard and
 * screen readers work without custom ARIA.
 */
export function ChipGroup<V extends string>(props: ChipGroupProps<V>) {
  const { legend, hideLegend, description, options, className } = props
  const name = useId()
  const descriptionId = `${name}-desc`

  return (
    <fieldset
      className={cn('min-w-0', className)}
      aria-describedby={description ? descriptionId : undefined}
    >
      <legend className={cn('mb-2.5 font-bold', hideLegend && 'sr-only')}>{legend}</legend>
      {description && (
        <p id={descriptionId} className="-mt-1 mb-3 text-[0.9375rem] text-ink-3">
          {description}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const checked =
            props.type === 'single'
              ? props.value === option.value
              : props.value.includes(option.value)
          return (
            <label key={option.value} className={chipBase}>
              <input
                className="sr-only"
                type={props.type === 'single' ? 'radio' : 'checkbox'}
                name={name}
                value={option.value}
                checked={checked}
                disabled={option.disabled}
                onChange={() => {
                  if (props.type === 'single') {
                    props.onChange(option.value)
                  } else {
                    props.onChange(
                      checked
                        ? props.value.filter((v) => v !== option.value)
                        : [...props.value, option.value],
                    )
                  }
                }}
                onClick={() => {
                  // Native radios cannot be unchecked: allow it, since nothing is mandatory.
                  if (props.type === 'single' && checked) props.onChange(null)
                }}
              />
              <Check aria-hidden="true" className={chipCheck} />
              {option.icon && (
                <span aria-hidden="true" className="[&>svg]:size-4 [&>svg]:stroke-[1.75]">
                  {option.icon}
                </span>
              )}
              <span>{option.label}</span>
              {option.note && <span className="text-xs font-normal text-ink-3">{option.note}</span>}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
