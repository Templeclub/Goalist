'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { callApi } from '@/features/friends/client-api'
import type { CardOffer, CardSocial } from '@/features/friends/queries'
import { reactionKinds } from '@/features/friends/schema'
import { Button } from '../ui/Button'
import { CommentThread } from './CommentThread'

type OwnCardSocialProps = {
  goalId: string
  userId: string
  social: CardSocial
  api?: typeof callApi
}

/** « Côté amis » on the owner's own card: what friends did, offers to answer (D-064). */
export function OwnCardSocial({ goalId, userId, social, api = callApi }: OwnCardSocialProps) {
  const t = useTranslations('friends')
  const [offers, setOffers] = useState(social.offers)
  const reacted = reactionKinds.filter((k) => social.reactions[k] > 0)
  const nothing =
    reacted.length === 0 &&
    social.interestCount === 0 &&
    offers.length === 0 &&
    social.comments.length === 0

  const answer = async (offerId: string, status: CardOffer['status']) => {
    if (await api(`/api/goals/${goalId}/offers/${offerId}`, 'PATCH', { status }))
      setOffers((o) => o.map((x) => (x.id === offerId ? { ...x, status } : x)))
  }

  return (
    <section
      aria-labelledby="own-social-title"
      className="grid gap-4 rounded-card border-[3px] border-outline bg-card p-4 shadow-card"
    >
      <h2 id="own-social-title" className="font-display text-xl font-extrabold">
        {t('own.title')}
      </h2>
      {nothing && <p className="text-[0.9375rem] text-ink-2">{t('own.nothing')}</p>}
      {reacted.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {reacted.map((k) => (
            <li
              key={k}
              className="rounded-full border-2 border-outline bg-gilt px-3 py-1 text-sm font-extrabold text-on-gilt"
            >
              {t('reactions.count', { label: t(`reactions.${k}`), count: social.reactions[k] })}
            </li>
          ))}
        </ul>
      )}
      {social.interestCount > 0 && (
        <p className="font-bold">
          {t('own.interested', { count: social.interestCount })}
          {social.interestedNames.some(Boolean) && (
            <span className="font-normal text-ink-2">
              {' : '}
              {social.interestedNames.map((n) => n ?? t('noName')).join(', ')}
            </span>
          )}
        </p>
      )}
      {offers.length > 0 && (
        <div className="grid gap-2">
          <h3 className="label-caps">{t('own.offers')}</h3>
          <ul className="grid gap-2">
            {offers.map((o) => (
              <li
                key={o.id}
                className="grid gap-2 rounded-md border-2 border-outline bg-paper-2 p-3"
              >
                <p className="text-[0.9375rem]">
                  <b>{o.authorName ?? t('noName')}</b>
                  {o.message ? ` : ${o.message}` : ''}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-extrabold">{t(`help.status.${o.status}`)}</span>
                  {o.status === 'open' && (
                    <>
                      <Button size="sm" onClick={() => void answer(o.id, 'accepted')}>
                        {t('own.accept')}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void answer(o.id, 'declined')}
                      >
                        {t('own.decline')}
                      </Button>
                    </>
                  )}
                  {(o.status === 'accepted' || o.status === 'declined') && (
                    <Button size="sm" variant="ghost" onClick={() => void answer(o.id, 'open')}>
                      {t('own.reopen')}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {social.comments.length > 0 && (
        <CommentThread
          goalId={goalId}
          userId={userId}
          initial={social.comments}
          canModerate
          canWrite={false}
          api={api}
        />
      )}
    </section>
  )
}
