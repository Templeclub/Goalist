'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { Button } from '../ui/Button'
import { NotebookIllustration } from '../ui/NotebookIllustration'

const steps = ['notebook', 'write', 'calm'] as const
export const ONBOARDED_KEY = 'elan:onboarded'

/** Three short screens, skippable at any time (docs/screens/00-onboarding.md). */
export function OnboardingFlow({ onDone }: { onDone: () => void }) {
  const t = useTranslations('onboarding')
  const [index, setIndex] = useState(0)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const step = steps[index]!
  const last = index === steps.length - 1
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    titleRef.current?.focus()
  }, [index])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, steps.length - 1))
      if (event.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const finish = () => {
    try {
      localStorage.setItem(ONBOARDED_KEY, '1')
    } catch {}
    onDone()
  }

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={finish}>
          {t('skip')}
        </Button>
      </div>
      <div
        key={step}
        className="grid flex-1 animate-rise content-center justify-items-center gap-5 text-center"
      >
        <NotebookIllustration
          className={cn(
            'transition-transform duration-200',
            index === 1 && '-rotate-3',
            index === 2 && 'rotate-2',
          )}
        />
        <h1 ref={titleRef} tabIndex={-1} className="font-display text-2xl font-medium outline-none">
          {t(`steps.${step}.title`)}
        </h1>
        <p className="max-w-[34ch] text-md text-ink-2">{t(`steps.${step}.body`)}</p>
        <p className="sr-only" aria-live="polite">
          {t('position', { current: index + 1, total: steps.length })}
        </p>
        <div aria-hidden="true" className="flex gap-2 pt-2">
          {steps.map((s, i) => (
            <span
              key={s}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === index ? 'w-6 bg-accent' : 'w-1.5 bg-line-strong',
              )}
            />
          ))}
        </div>
      </div>
      <Button block onClick={last ? finish : () => setIndex(index + 1)}>
        {last ? t('start') : t('next')}
      </Button>
    </section>
  )
}
