'use client'

import { useTranslations } from 'next-intl'
import { useId, useRef, type KeyboardEvent } from 'react'
import { LIMITS } from '@/config/app'
import { Link } from '@/i18n/navigation'
import { Button } from '../ui/Button'
import { Chip } from '../ui/Chip'
import { Sheet, SheetContent } from '../ui/Sheet'

type CaptureSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  onValueChange: (value: string) => void
  onKeep: () => void
  busy?: boolean
  /** Shown with the very first wish, before any session exists. */
  showConsent?: boolean
  error?: string | null
}

/** Express capture: one field, keyboard open, "Garder" within thumb reach (docs/screens/02). */
export function CaptureSheet({
  open,
  onOpenChange,
  value,
  onValueChange,
  onKeep,
  busy,
  showConsent,
  error,
}: CaptureSheetProps) {
  const t = useTranslations('capture.express')
  const tHome = useTranslations('home.empty.examples')
  const id = useId()
  const fieldRef = useRef<HTMLTextAreaElement>(null)
  const canKeep = value.trim().length > 0 && !busy
  const remaining = LIMITS.titleMaxLength - value.length
  const examples = [tHome('stars'), tHome('bread'), tHome('letter')]

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      if (canKeep) onKeep()
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <SheetContent
        title={t('label')}
        hideTitle
        full
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          fieldRef.current?.focus()
        }}
        footer={
          <div className="grid gap-2">
            {showConsent && (
              <p className="text-sm text-ink-3">
                {t.rich('consent', {
                  link: (chunks) => (
                    <Link href="/privacy" className="underline underline-offset-2">
                      {chunks}
                    </Link>
                  ),
                })}
              </p>
            )}
            <Button block onClick={onKeep} disabled={!canKeep} aria-busy={busy}>
              {busy ? t('keeping') : t('keep')}
            </Button>
          </div>
        }
      >
        <p aria-hidden="true" className="-mt-1 label-caps">
          {t('label')}
        </p>
        <label htmlFor={id} className="sr-only">
          {t('field')}
        </label>
        <textarea
          ref={fieldRef}
          id={id}
          rows={3}
          maxLength={LIMITS.titleMaxLength}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t('placeholder')}
          aria-describedby={`${id}-hint`}
          enterKeyHint="done"
          autoCapitalize="sentences"
          className="min-h-28 w-full resize-none bg-transparent font-display text-xl font-medium tracking-[-0.005em] text-ink placeholder:font-normal placeholder:text-ink-3 placeholder:italic focus-visible:outline-none"
        />
        <p id={`${id}-hint`} className="text-[0.9375rem] text-ink-3">
          {remaining <= 20 ? t('counter', { remaining }) : t('hint')}
        </p>
        {error && (
          <p
            role="alert"
            className="rounded-md bg-accent-soft px-3 py-2.5 text-[0.9375rem] text-accent-strong"
          >
            {error}
          </p>
        )}
        {value.length === 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {examples.map((example) => (
              <Chip key={example} variant="add" onClick={() => onValueChange(example)}>
                {example}
              </Chip>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
