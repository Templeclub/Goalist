'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useId, useState } from 'react'
import {
  applyMotion,
  applyTheme,
  storedMotion,
  storedTheme,
  themes,
  type Theme,
} from '@/features/theme/theme'
import { cn } from '@/lib/cn'

const swatch: Record<Theme, string> = {
  system: 'bg-[linear-gradient(135deg,#fff6e5_50%,#15132b_50%)]',
  light: 'bg-[#fff6e5]',
  dark: 'bg-[#15132b]',
}

type ThemePickerProps = {
  /** The theme saved on the account, used when this device has none yet. */
  accountTheme?: Theme | null
  /** Injected in stories and tests. */
  save?: (theme: Theme) => Promise<unknown>
}

const saveOnAccount = (theme: Theme) =>
  fetch('/api/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ theme }),
  }).catch(() => null)

/** « Apparence » in Moi: theme (automatic, light, dark) and card animations (D-063). */
export function ThemePicker({ accountTheme, save = saveOnAccount }: ThemePickerProps) {
  const t = useTranslations('me.appearance')
  const id = useId()
  const [theme, setTheme] = useState<Theme>('system')
  const [motion, setMotion] = useState(true)

  // Read the device's choice after hydration; an account choice fills a device without one.
  useEffect(() => {
    const device = storedTheme()
    const initial = device ?? accountTheme ?? 'system'
    if (!device && accountTheme && accountTheme !== 'system') applyTheme(accountTheme)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing with localStorage
    setTheme(initial)
    setMotion(storedMotion())
  }, [accountTheme])

  const choose = (next: Theme) => {
    setTheme(next)
    applyTheme(next)
    void save(next)
  }

  return (
    <div className="grid gap-4">
      <fieldset className="grid gap-2">
        <legend className="mb-2 font-extrabold">{t('theme')}</legend>
        <div role="radiogroup" aria-describedby={`${id}-hint`} className="grid grid-cols-3 gap-2">
          {themes.map((option) => {
            const checked = theme === option
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => choose(option)}
                className={cn(
                  'grid min-h-24 cursor-pointer content-end justify-items-center gap-1.5 rounded-md border-2 p-2 font-extrabold',
                  checked
                    ? 'border-outline bg-accent-soft text-accent-strong shadow-card'
                    : 'border-line-strong bg-card text-ink hover:bg-paper-2',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn('h-11 w-8 rounded-[6px] border-2 border-outline', swatch[option])}
                />
                {t(`themes.${option}`)}
              </button>
            )
          })}
        </div>
        <p id={`${id}-hint`} className="text-sm text-ink-2">
          {t('themeHint')}
        </p>
      </fieldset>

      <div className="grid gap-1 border-t-2 border-dashed border-line pt-3">
        <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 font-extrabold">
          {t('motion')}
          <input
            type="checkbox"
            checked={motion}
            aria-describedby={`${id}-motion`}
            onChange={(e) => {
              setMotion(e.target.checked)
              applyMotion(e.target.checked)
            }}
            className="size-6 cursor-pointer accent-accent"
          />
        </label>
        <p id={`${id}-motion`} className="text-sm text-ink-2">
          {t('motionHint')}
        </p>
      </div>
    </div>
  )
}
