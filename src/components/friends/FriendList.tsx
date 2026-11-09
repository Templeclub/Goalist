'use client'

import { useFormatter, useTranslations } from 'next-intl'
import { useState } from 'react'
import { callApi } from '@/features/friends/client-api'
import { useRouter } from '@/i18n/navigation'
import { Button } from '../ui/Button'

export type FriendItem = { id: string; name: string | null; since: string; sharedCount: number }

type FriendListProps = { friends: FriendItem[]; api?: typeof callApi }

/** The viewer's friends; removing one asks once, calmly (D-064). */
export function FriendList({ friends, api = callApi }: FriendListProps) {
  const t = useTranslations('friends')
  const format = useFormatter()
  const router = useRouter()
  const [confirming, setConfirming] = useState<string | null>(null)
  const [removed, setRemoved] = useState<string[]>([])

  const remove = async (id: string) => {
    const ok = await api(`/api/friends/${id}`, 'DELETE')
    setConfirming(null)
    if (ok) {
      setRemoved((r) => [...r, id])
      router.refresh()
    }
  }

  const shown = friends.filter((f) => !removed.includes(f.id))
  if (shown.length === 0) return <p className="text-[0.9375rem] text-ink-2">{t('list.empty')}</p>

  return (
    <ul className="grid gap-2">
      {shown.map((f) => {
        const name = f.name ?? t('noName')
        return (
          <li
            key={f.id}
            className="grid gap-2 rounded-card border-2 border-outline bg-card px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-extrabold">{name}</p>
                <p className="text-sm text-ink-2">
                  {t('list.shared', { count: f.sharedCount })} ·{' '}
                  {t('list.since', {
                    date: format.dateTime(new Date(f.since), { dateStyle: 'medium' }),
                  })}
                </p>
              </div>
              {confirming !== f.id && (
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`${t('list.remove')} ${name}`}
                  onClick={() => setConfirming(f.id)}
                >
                  {t('list.remove')}
                </Button>
              )}
            </div>
            {confirming === f.id && (
              <div role="group" className="grid gap-2 rounded-md bg-paper-2 p-3">
                <p className="text-[0.9375rem]">{t('list.removeConfirm', { name })}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => void remove(f.id)}>
                    {t('list.removeYes')}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>
                    {t('list.removeNo')}
                  </Button>
                </div>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
