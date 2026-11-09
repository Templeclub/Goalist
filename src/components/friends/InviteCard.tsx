'use client'

import { Copy, RefreshCw, Share2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { callApi } from '@/features/friends/client-api'
import { Button } from '../ui/Button'

type InviteCardProps = {
  appName: string
  /** Injected in stories and tests. */
  api?: typeof callApi
}

/** « Inviter un ami »: the personal invite link, shared, copied or renewed (D-064). */
export function InviteCard({ appName, api = callApi }: InviteCardProps) {
  const t = useTranslations('friends.invite')
  const [code, setCode] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void api<{ code: string | null }>('/api/friends/invite', 'GET').then((body) => {
      setCode(body?.code ?? null)
      setLoaded(true)
    })
  }, [api])

  const link = code ? `${window.location.origin}/friends/invite/${code}` : null

  const create = async (renew: boolean) => {
    setBusy(true)
    const body = await api<{ code: string }>('/api/friends/invite', 'POST')
    setBusy(false)
    if (!body?.code) return setNote(t('failed'))
    setCode(body.code)
    setNote(renew ? t('renewed') : null)
  }

  const share = async () => {
    if (!link) return
    if (navigator.share) {
      await navigator
        .share({ title: appName, text: t('shareText', { appName }), url: link })
        .catch(() => {})
      return
    }
    await navigator.clipboard?.writeText(link).catch(() => {})
    setNote(t('copied'))
  }

  return (
    <section
      aria-labelledby="invite-title"
      className="grid gap-3 rounded-card border-[3px] border-outline bg-accent-soft p-4 shadow-card"
    >
      <h2 id="invite-title" className="font-display text-xl font-extrabold">
        {t('title')}
      </h2>
      <p className="text-[0.9375rem] text-ink-2">{t('body')}</p>
      {loaded && !link && (
        <Button disabled={busy} onClick={() => void create(false)}>
          {t('create')}
        </Button>
      )}
      {link && (
        <>
          <p className="truncate rounded-md border-2 border-outline bg-card px-3 py-2.5 font-mono text-sm">
            {link}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => void share()}>
              <Share2 aria-hidden="true" className="size-4" />
              {t('share')}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                void navigator.clipboard
                  ?.writeText(link)
                  .then(() => setNote(t('copied')))
                  .catch(() => {})
              }
            >
              <Copy aria-hidden="true" className="size-4" />
              {t('copy')}
            </Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => void create(true)}>
              <RefreshCw aria-hidden="true" className="size-4" />
              {t('renew')}
            </Button>
          </div>
        </>
      )}
      <p role="status" className="min-h-5 text-sm font-bold text-ink-2">
        {note}
      </p>
    </section>
  )
}
