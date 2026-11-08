'use client'

import { useTranslations } from 'next-intl'
import { useId, useLayoutEffect, useRef, useState, type TextareaHTMLAttributes } from 'react'
import type { Sender } from '@/features/autosave/patch-queue'
import { useAutosave } from '@/features/autosave/use-autosave'
import type { GoalPatch } from '@/features/goals/api-schema'
import { goalSender } from '@/features/goals/client-api'
import { LIMITS } from '@/config/app'
import { cn } from '@/lib/cn'
import { SaveIndicator } from '../ui/SaveIndicator'

/** Textarea that grows with its content (no inner scrollbar). */
function AutoGrow({ className, value, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      className={cn('resize-none overflow-hidden', className)}
      {...props}
    />
  )
}

type GoalNameEditorProps = {
  goalId: string
  version: number
  title: string
  tagline: string | null
  emoji: string | null
  /** Injected in stories and tests; defaults to the real API. */
  send?: Sender<GoalPatch>
}

/** Phase 1 detail: name the wish directly on its page, saved as you type (docs/screens/06). */
export function GoalNameEditor({
  goalId,
  version,
  title: initialTitle,
  tagline: initialTagline,
  emoji: initialEmoji,
  send,
}: GoalNameEditorProps) {
  const t = useTranslations('goals.detail')
  const id = useId()
  const [title, setTitle] = useState(initialTitle)
  const [tagline, setTagline] = useState(initialTagline ?? '')
  const [emoji, setEmoji] = useState(initialEmoji ?? '')
  const autosave = useAutosave<GoalPatch>({
    send: send ?? goalSender(goalId),
    version,
    storageKey: `elan:pending:goal:${goalId}`,
  })

  const titleEmpty = title.trim().length === 0

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <SaveIndicator state={autosave.state} />
      </div>
      <label htmlFor={`${id}-emoji`} className="sr-only">
        {t('emojiLabel')}
      </label>
      <input
        id={`${id}-emoji`}
        value={emoji}
        maxLength={16}
        placeholder={t('emojiPlaceholder')}
        onChange={(e) => {
          setEmoji(e.target.value)
          autosave.set('emoji', e.target.value.trim() || null)
        }}
        className="w-16 rounded-md bg-transparent text-[2.625rem] leading-none placeholder:opacity-30 focus-visible:bg-card"
      />
      <label htmlFor={`${id}-title`} className="sr-only">
        {t('titleLabel')}
      </label>
      <AutoGrow
        id={`${id}-title`}
        value={title}
        maxLength={LIMITS.titleMaxLength}
        aria-describedby={titleEmpty ? `${id}-title-note` : undefined}
        onChange={(e) => {
          const next = e.target.value.replace(/\n/g, ' ')
          setTitle(next)
          // A wish always keeps a title: an empty one is never sent.
          if (next.trim()) autosave.set('title', next.trim())
        }}
        className="-mx-1 rounded-md bg-transparent px-1 font-display text-3xl font-medium tracking-[-0.015em] text-balance text-ink focus-visible:bg-card"
      />
      {titleEmpty && (
        <p id={`${id}-title-note`} className="-mt-2 text-[0.9375rem] text-accent-strong">
          {t('titleKept')}
        </p>
      )}
      <label htmlFor={`${id}-tagline`} className="sr-only">
        {t('taglineLabel')}
      </label>
      <AutoGrow
        id={`${id}-tagline`}
        value={tagline}
        maxLength={LIMITS.taglineMaxLength}
        placeholder={t('taglinePlaceholder')}
        onChange={(e) => {
          const next = e.target.value.replace(/\n/g, ' ')
          setTagline(next)
          autosave.set('tagline', next.trim() || null)
        }}
        className="-mx-1 -mt-2 rounded-md bg-transparent px-1 font-display text-lg text-ink-2 italic placeholder:text-ink-3 focus-visible:bg-card"
      />
    </div>
  )
}
