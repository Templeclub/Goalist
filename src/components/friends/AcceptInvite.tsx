'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { callApi } from '@/features/friends/client-api'
import { useRouter } from '@/i18n/navigation'
import { Button } from '../ui/Button'

/** « Accepter l'invitation »: becomes friends, then opens the Amis tab (D-064). */
export function AcceptInvite({ code, api = callApi }: { code: string; api?: typeof callApi }) {
  const t = useTranslations('friends.acceptPage')
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  const accept = async () => {
    setBusy(true)
    const res = await api('/api/friends/accept', 'POST', { code })
    setBusy(false)
    if (!res) return setFailed(true)
    router.push('/friends')
    router.refresh()
  }

  return (
    <div className="grid gap-2">
      <Button block disabled={busy} onClick={() => void accept()}>
        {t('accept')}
      </Button>
      {failed && (
        <p role="status" className="text-sm font-bold text-ink-2">
          {t('failed')}
        </p>
      )}
    </div>
  )
}
