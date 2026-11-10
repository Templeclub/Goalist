import { HandHeart, MessageCircle, PartyPopper, Sparkles } from 'lucide-react'
import { getFormatter, getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { FriendList } from '@/components/friends/FriendList'
import { InviteCard } from '@/components/friends/InviteCard'
import { GoalCard, GoalCardSkeleton } from '@/components/goal/GoalCard'
import { cardProps } from '@/components/goal/card-props'
import { buttonVariants } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { APP_NAME } from '@/config/app'
import { getViewer } from '@/features/auth/session'
import {
  friendFeed,
  listFriends,
  myCardsActivity,
  type ActivityItem,
} from '@/features/friends/queries'
import { Link } from '@/i18n/navigation'
import { initLocale } from '@/i18n/page-locale'

export async function generateMetadata({ params }: PageProps<'/[locale]/friends'>) {
  const locale = await initLocale(params)
  const t = await getTranslations({ locale, namespace: 'friends' })
  return { title: t('title') }
}

const gridClass = 'grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5'

/** « Amis » (D-064): invite, what happened on my cards, my friends' shared cards, my friends. */
export default async function FriendsPage({ params }: PageProps<'/[locale]/friends'>) {
  await initLocale(params)
  const t = await getTranslations('friends')
  return (
    <div className="mx-auto grid w-full max-w-7xl content-start gap-6 px-[max(1rem,env(safe-area-inset-left))] pt-[max(1.5rem,env(safe-area-inset-top))] pb-12 md:px-8 md:pt-10">
      <header className="grid max-w-2xl gap-1">
        <h1 className="font-display text-3xl font-extrabold">{t('title')}</h1>
        <p className="text-md text-ink-2">{t('intro')}</p>
      </header>
      <Suspense
        fallback={
          <div className="grid gap-4">
            <Skeleton className="h-36 w-full max-w-2xl rounded-card" />
            <div className={gridClass}>
              <GoalCardSkeleton />
              <GoalCardSkeleton />
            </div>
          </div>
        }
      >
        <FriendsView />
      </Suspense>
    </div>
  )
}

const activityIcon = {
  reaction: PartyPopper,
  comment: MessageCircle,
  interest: Sparkles,
  offer: HandHeart,
} as const

async function FriendsView() {
  const [t, format, viewer] = await Promise.all([
    getTranslations('friends'),
    getFormatter(),
    getViewer(),
  ])

  if (!viewer || viewer.isAnonymous) {
    return (
      <section className="grid max-w-xl justify-items-start gap-3 rounded-card border-[3px] border-dashed border-line-strong bg-card p-6">
        <h2 className="font-display text-xl font-extrabold">{t('needAccount.title')}</h2>
        <p className="text-md text-ink-2">{t('needAccount.body')}</p>
        <Link href="/sign-in?next=/friends" className={buttonVariants({ size: 'sm' })}>
          {t('needAccount.action')}
        </Link>
      </section>
    )
  }

  const friends = await listFriends()
  const [feed, activity] = await Promise.all([
    friendFeed(friends),
    myCardsActivity(viewer.id, friends),
  ])

  const line = (a: ActivityItem) => {
    const name = a.authorName ?? t('noName')
    const title = `${a.goal.emoji ? `${a.goal.emoji} ` : ''}${a.goal.title}`
    if (a.kind === 'reaction')
      return t('activity.reaction', {
        name,
        title,
        reaction: t(`reactions.${a.reaction ?? 'bravo'}`),
      })
    if (a.kind === 'comment') return t('activity.comment', { name, title, text: a.text ?? '' })
    if (a.kind === 'interest') return t('activity.interest', { name, title })
    return t('activity.offer', { name, title })
  }

  return (
    <>
      <div className="grid max-w-2xl gap-6">
        <InviteCard appName={APP_NAME} />

        <section aria-labelledby="activity-title" className="grid gap-3">
          <h2 id="activity-title" className="font-display text-xl font-extrabold">
            {t('activity.title')}
          </h2>
          {activity.length === 0 ? (
            <p className="text-[0.9375rem] text-ink-2">{t('activity.empty')}</p>
          ) : (
            <ul className="grid rounded-card border-[3px] border-outline bg-card">
              {activity.map((a, i) => {
                const Icon = activityIcon[a.kind]
                return (
                  <li key={a.id} className={i > 0 ? 'border-t-2 border-dashed border-line' : ''}>
                    <Link
                      href={`/goals/${a.goal.id}`}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-paper-2"
                    >
                      <Icon
                        aria-hidden="true"
                        className="mt-0.5 size-5 shrink-0 stroke-[2.5] text-accent"
                      />
                      <span className="flex-1 text-[0.9375rem]">
                        {line(a)}
                        <span className="block text-sm text-ink-3">
                          {format.dateTime(new Date(a.at), { dateStyle: 'medium' })}
                        </span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      <section aria-labelledby="feed-title" className="grid gap-3">
        <h2 id="feed-title" className="font-display text-xl font-extrabold">
          {t('feed.title')}
        </h2>
        {feed.length === 0 ? (
          <p className="max-w-2xl text-[0.9375rem] text-ink-2">{t('feed.empty')}</p>
        ) : (
          <ul className={gridClass}>
            {feed.map((goal) => (
              <li key={goal.id} className="grid content-start gap-1.5">
                <Link
                  href={`/friends/${goal.ownerId}`}
                  className="flex min-h-11 items-center truncate text-sm font-extrabold text-accent-strong hover:underline"
                >
                  {t('feed.by', { name: goal.ownerName ?? t('noName') })}
                </Link>
                <GoalCard
                  size="compact"
                  href={`/friends/cards/${goal.id}`}
                  {...cardProps(goal)}
                  className="h-full"
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="list-title" className="grid max-w-2xl gap-3">
        <h2 id="list-title" className="font-display text-xl font-extrabold">
          {t('list.title')}
        </h2>
        <FriendList friends={friends} />
      </section>
    </>
  )
}
