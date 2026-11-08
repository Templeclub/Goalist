'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Button } from '../ui/Button'

/** In-line, gentle confirmation: restoring never deletes anything (docs/screens/09). */
export function RestoreButton({ goalId, revisionId }: { goalId: string; revisionId: number }) {
  const t = useTranslations('goals.history')
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const restore = async () => {
    setBusy(true)
    const response = await fetch(`/api/goals/${goalId}/revisions/${revisionId}/restore`, {
      method: 'POST',
    }).catch(() => null)
    setBusy(false)
    setConfirming(false)
    if (response?.ok) {
      try {
        // The detail page must not replay older unsent edits over the restored version.
        localStorage.removeItem(`elan:pending:goal:${goalId}`)
        localStorage.removeItem(`elan:pending:values:${goalId}`)
      } catch {}
      setMessage(t('restored'))
      router.refresh()
    } else {
      setMessage(t('failed'))
    }
  }

  return (
    <div className="grid gap-2">
      {confirming ? (
        <div className="grid gap-2 rounded-md bg-paper-2 p-3">
          <p className="text-[0.9375rem] text-ink-2">{t('confirm')}</p>
          <div className="flex gap-2">
            <Button size="sm" disabled={busy} onClick={() => void restore()}>
              {t('confirmYes')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
              {t('confirmNo')}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="sm"
          variant="secondary"
          className="justify-self-start"
          onClick={() => setConfirming(true)}
        >
          {t('restore')}
        </Button>
      )}
      {message && (
        <p role="status" className="text-[0.9375rem] text-ink-2">
          {message}
        </p>
      )}
    </div>
  )
}
