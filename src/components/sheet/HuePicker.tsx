'use client'

import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useId } from 'react'
import { customHues } from '@/features/goals/palette'
import { cn } from '@/lib/cn'
import { toneProps } from '../goal/tone'

type Hue = (typeof customHues)[number]

/** Optional ribbon colour: the 12 category hues (equal lightness) or none. */
export function HuePicker({
  value,
  onChange,
  legend,
}: {
  value: Hue | null
  onChange: (hue: Hue | null) => void
  legend: string
}) {
  const t = useTranslations('flow.name')
  const name = useId()
  const options: (Hue | null)[] = [null, ...customHues]
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 font-bold">{legend}</legend>
      <p className="mb-3 text-[0.9375rem] text-ink-3">{t('hueHint')}</p>
      <div className="flex flex-wrap gap-1">
        {options.map((hue) => (
          <label
            key={hue ?? 'none'}
            className="group relative grid size-11 cursor-pointer place-items-center rounded-full has-focus-visible:outline-2 has-focus-visible:outline-accent"
          >
            <input
              type="radio"
              className="sr-only"
              name={name}
              checked={value === hue}
              onChange={() => onChange(hue)}
              aria-label={hue === null ? t('hueNone') : t('hueOption', { hue })}
            />
            <span
              {...toneProps(hue)}
              aria-hidden="true"
              className={cn(
                'grid size-8 place-items-center rounded-full bg-tone-ribbon ring-offset-2 ring-offset-paper group-has-checked:ring-2 group-has-checked:ring-ink',
                hue === null && 'border-2 border-dashed border-line-strong bg-transparent',
              )}
            >
              <Check className="hidden size-4 stroke-3 text-paper group-has-checked:block" />
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
