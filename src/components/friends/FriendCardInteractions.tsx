'use client'

import { HandHeart, PartyPopper, Sparkles, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'
import { callApi } from '@/features/friends/client-api'
import type { CardSocial } from '@/features/friends/queries'
import { reactionKinds, type ReactionKind } from '@/features/friends/schema'
import { createGoal } from '@/features/goals/client-api'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { uuidv7 } from '@/lib/uuid'
import { AutoGrowTextarea } from '../ui/AutoGrowTextarea'
import { Button } from '../ui/Button'
import { inputClass } from '../ui/Field'

const icon: Record<ReactionKind, typeof PartyPopper> = {
  bravo: PartyPopper,
  courage: Zap,
  inspire: Sparkles,
}

type FriendCardInteractionsProps = {
  goalId: string
  title: string
  social: Pick<CardSocial, 'reactions' | 'mine' | 'meToo' | 'offers'>
  api?: typeof callApi
  copy?: (title: string) => Promise<string | null>
}

const copyCard = async (title: string) => {
  const id = uuidv7()
  return createGoal({ id, title })
    .then(() => id)
    .catch(() => null)
}

/** Encourage, « moi aussi », « je peux aider » on a friend's shared card (D-064). */
export function FriendCardInteractions({
  goalId,
  title,
  social,
  api = callApi,
  copy = copyCard,
}: FriendCardInteractionsProps) {
  const t = useTranslations('friends')
  const id = useId()
  const [counts, setCounts] = useState(social.reactions)
  const [mine, setMine] = useState<ReactionKind[]>(social.mine)
  const [meToo, setMeToo] = useState(social.meToo)
  const [copied, setCopied] = useState<string | null>(null)
  const [offers, setOffers] = useState(social.offers)
  const [message, setMessage] = useState('')
  const [note, setNote] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const toggleReaction = async (kind: ReactionKind) => {
    const on = mine.includes(kind)
    const ok = on
      ? await api(`/api/goals/${goalId}/reactions?kind=${kind}`, 'DELETE')
      : await api(`/api/goals/${goalId}/reactions`, 'POST', { kind })
    if (!ok) return setNote(t('failed'))
    setMine((m) => (on ? m.filter((k) => k !== kind) : [...m, kind]))
    setCounts((c) => ({ ...c, [kind]: c[kind] + (on ? -1 : 1) }))
  }

  const toggleMeToo = async () => {
    const ok = await api(`/api/goals/${goalId}/interest`, meToo ? 'DELETE' : 'POST')
    if (!ok) return setNote(t('failed'))
    setMeToo(!meToo)
  }

  const offer = async () => {
    setBusy(true)
    const res = await api<{ id: string }>(`/api/goals/${goalId}/offers`, 'POST', {
      message: message.trim() || undefined,
    })
    setBusy(false)
    if (!res) return setNote(t('failed'))
    setOffers((o) => [
      {
        id: res.id,
        message: message.trim() || null,
        status: 'open',
        at: new Date().toISOString(),
        authorId: null,
        authorName: null,
      },
      ...o,
    ])
    setMessage('')
    setNote(t('help.sent'))
  }

  const withdraw = async (offerId: string) => {
    if (await api(`/api/goals/${goalId}/offers/${offerId}`, 'PATCH', { status: 'withdrawn' }))
      setOffers((o) => o.map((x) => (x.id === offerId ? { ...x, status: 'withdrawn' } : x)))
  }

  return (
    <div className="grid gap-5">
      <div role="group" aria-label={t('reactions.label')} className="flex flex-wrap gap-2">
        {reactionKinds.map((kind) => {
          const Icon = icon[kind]
          const on = mine.includes(kind)
          return (
            <button
              key={kind}
              type="button"
              aria-pressed={on}
              onClick={() => void toggleReaction(kind)}
              className={cn(
                'inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border-2 border-outline px-3.5 font-extrabold transition-transform active:translate-y-0.5',
                on ? 'bg-gilt text-on-gilt shadow-card' : 'bg-card text-ink hover:bg-paper-2',
              )}
            >
              <Icon aria-hidden="true" className="size-4 stroke-[2.5]" />
              {counts[kind] > 0
                ? t('reactions.count', { label: t(`reactions.${kind}`), count: counts[kind] })
                : t(`reactions.${kind}`)}
            </button>
          )
        })}
      </div>

      <div className="grid gap-2 rounded-card border-2 border-outline bg-card p-3.5">
        <Button
          variant={meToo ? 'secondary' : 'primary'}
          aria-pressed={meToo}
          onClick={() => void toggleMeToo()}
          className="justify-self-start"
        >
          {meToo ? `✓ ${t('meToo.on')}` : t('meToo.label')}
        </Button>
        {meToo &&
          (copied ? (
            <p className="text-sm font-bold">
              {t('meToo.copied')}{' '}
              <Link href={`/goals/${copied}`} className="text-accent-strong underline">
                {t('meToo.open')}
              </Link>
            </p>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="justify-self-start"
              onClick={() => void copy(title).then(setCopied)}
            >
              {t('meToo.copy')}
            </Button>
          ))}
      </div>

      <section
        aria-labelledby={`${id}-help`}
        className="grid gap-2 rounded-card border-2 border-outline bg-card p-3.5"
      >
        <h2
          id={`${id}-help`}
          className="flex items-center gap-2 font-display text-lg font-extrabold"
        >
          <HandHeart aria-hidden="true" className="size-5" />
          {t('help.title')}
        </h2>
        {offers.map((o) => (
          <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span>
              {o.message ?? '—'} · <b>{t(`help.status.${o.status}`)}</b>
            </span>
            {o.status === 'open' && (
              <Button size="sm" variant="ghost" onClick={() => void withdraw(o.id)}>
                {t('help.withdraw')}
              </Button>
            )}
          </div>
        ))}
        <label htmlFor={`${id}-offer`} className="sr-only">
          {t('help.title')}
        </label>
        <AutoGrowTextarea
          id={`${id}-offer`}
          value={message}
          maxLength={500}
          placeholder={t('help.placeholder')}
          onChange={(e) => setMessage(e.target.value)}
          className={inputClass}
        />
        <Button size="sm" className="justify-self-end" disabled={busy} onClick={() => void offer()}>
          {t('help.send')}
        </Button>
      </section>

      <p role="status" className="min-h-5 text-sm font-bold text-ink-2">
        {note}
      </p>
    </div>
  )
}
