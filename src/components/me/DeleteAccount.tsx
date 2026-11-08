'use client'

import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'
import { Button } from '../ui/Button'
import { inputClass } from '../ui/Field'

/** Self-service deletion with an in-place, typed confirmation (the only red in the product). */
export function DeleteAccount() {
  const t = useTranslations('me.data')
  const id = useId()
  const [open, setOpen] = useState(false)
  const [word, setWord] = useState('')
  const [busy, setBusy] = useState(false)
  const [state, setState] = useState<'idle' | 'failed' | 'deleted'>('idle')

  const confirmWord = t('deleteWord')
  const remove = async () => {
    setBusy(true)
    const response = await fetch('/api/account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: 'supprimer' }),
    }).catch(() => null)
    setBusy(false)
    if (!response?.ok) return setState('failed')
    try {
      localStorage.clear()
      sessionStorage.clear()
      navigator.serviceWorker?.controller?.postMessage('clear')
      if ('caches' in window) for (const key of await caches.keys()) await caches.delete(key)
    } catch {}
    setState('deleted')
  }

  if (state === 'deleted') {
    return (
      <div role="status" className="grid gap-3 rounded-card bg-paper-2 p-5">
        <p className="text-md">{t('deleted')}</p>
        {/* A full reload: no state of the deleted session survives. */}
        <Button
          variant="secondary"
          className="justify-self-start"
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload on purpose
          onClick={() => window.location.assign('/')}
        >
          {t('backHome')}
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      <p className="text-[0.9375rem] text-ink-2">{t('deleteHint')}</p>
      {!open ? (
        <Button
          variant="secondary"
          className="justify-self-start text-danger"
          onClick={() => setOpen(true)}
        >
          {t('delete')}
        </Button>
      ) : (
        <div className="grid gap-3 rounded-md border border-danger/40 bg-danger-soft/40 p-4">
          <label htmlFor={id} className="text-[0.9375rem]">
            {t('deleteConfirm')}
          </label>
          <input
            id={id}
            value={word}
            autoComplete="off"
            onChange={(e) => setWord(e.target.value)}
            className={inputClass}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="danger"
              disabled={busy || word.trim().toLowerCase() !== confirmWord}
              onClick={() => void remove()}
            >
              {t('deleteNow')}
            </Button>
            <Button variant="ghost" onClick={() => (setOpen(false), setWord(''))}>
              {t('cancel')}
            </Button>
          </div>
          {state === 'failed' && (
            <p role="alert" className="text-[0.9375rem] text-ink">
              {t('deleteFailed')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
