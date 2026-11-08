'use client'

import { useTranslations } from 'next-intl'
import { Sheet, SheetContent, SheetTrigger } from './Sheet'

type HelpDrawerProps = {
  /** Name of the field the help is about (used in the button's accessible name and as title). */
  field: string
  explanation: string
  example?: { before: string; after: string }
}

/** The "?" button: explanation + a concrete before → after example. */
export function HelpDrawer({ field, explanation, example }: HelpDrawerProps) {
  const t = useTranslations('common.help')
  return (
    <Sheet>
      <SheetTrigger
        aria-label={t('open', { field })}
        className="group inline-grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-accent focus-visible:outline-2 focus-visible:outline-accent"
      >
        <span
          aria-hidden="true"
          className="grid size-[1.875rem] place-items-center rounded-full border-[1.5px] border-current text-[0.9375rem] font-bold group-data-[state=open]:bg-accent-soft"
        >
          {'?'}
        </span>
      </SheetTrigger>
      <SheetContent title={field}>
        <p className="text-md text-ink-2">{explanation}</p>
        {example && (
          <div className="grid gap-3 rounded-md bg-paper-2 px-4 py-3.5">
            <p className="label-caps">{t('example')}</p>
            <div className="grid grid-cols-[3.5rem_1fr] items-baseline gap-2">
              <span className="label-caps">{t('before')}</span>
              <span className="text-ink-2">{example.before}</span>
              <span className="label-caps">{t('after')}</span>
              <span>{example.after}</span>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
