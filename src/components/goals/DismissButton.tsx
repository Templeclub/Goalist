'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { uuidv7 } from '@/lib/uuid'
import { Button } from '../ui/Button'

/** "Ne plus me le proposer": the wish stays in the notebook, it only leaves "Fiches à compléter". */
export function DismissButton({
  goalId,
  version,
  title,
}: {
  goalId: string
  version: number
  title: string
}) {
  const t = useTranslations('goals.list')
  const router = useRouter()
  const [done, setDone] = useState(false)

  const dismiss = async () => {
    const response = await fetch(`/api/goals/${goalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patch: { completion_dismissed: true },
        baseVersion: version,
        clientMutationId: uuidv7(),
      }),
    }).catch(() => null)
    if (response?.ok) {
      setDone(true)
      router.refresh()
    }
  }

  if (done) {
    return (
      <p role="status" className="text-sm text-ink-3">
        {t('dismissed')}
      </p>
    )
  }
  return (
    <Button
      size="sm"
      variant="ghost"
      className="justify-self-start text-sm"
      aria-label={`${t('dismiss')} : ${title}`}
      onClick={() => void dismiss()}
    >
      {t('dismiss')}
    </Button>
  )
}
