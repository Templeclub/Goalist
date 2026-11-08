'use client'

import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'
import type { Sender } from '@/features/autosave/patch-queue'
import { useAutosave } from '@/features/autosave/use-autosave'
import { profileSender } from '@/features/goals/client-api'
import { Field, inputClass } from '../ui/Field'
import { SaveIndicator } from '../ui/SaveIndicator'

type Patch = { displayName?: string | null }

export function PseudoField({ initial, send }: { initial: string | null; send?: Sender<Patch> }) {
  const t = useTranslations('me.pseudo')
  const id = useId()
  const [value, setValue] = useState(initial ?? '')
  const autosave = useAutosave<Patch>({
    send: send ?? profileSender,
    version: 1,
    storageKey: 'elan:pending:profile',
  })

  return (
    <div className="grid gap-2">
      <Field id={id} label={t('label')} hint={t('hint')} optional>
        <input
          id={id}
          value={value}
          maxLength={40}
          autoComplete="nickname"
          placeholder={t('placeholder')}
          aria-describedby={`${id}-hint`}
          onChange={(e) => {
            setValue(e.target.value)
            autosave.set('displayName', e.target.value.trim() || null)
          }}
          className={inputClass}
        />
      </Field>
      <SaveIndicator state={autosave.state} className="justify-self-end" />
    </div>
  )
}
