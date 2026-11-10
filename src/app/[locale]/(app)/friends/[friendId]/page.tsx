import { ChevronLeft, Eye } from 'lucide-react'
import { getFormatter, getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { z } from 'zod'
import { GoalCard, GoalCardSkeleton } from '@/components/goal/GoalCard'
import { cardProps } from '@/components/goal/card-props'
import { Skeleton } from '@/components/ui/Skeleton'
import { getViewer } from '@/features/auth/session'
import { friendFeed, listFriends } from '@/features/friends/queries'
import { Link } from '@/i18n/navigation'
import { initLocale } from '@/i18n/page-locale'

const gridClass = 'grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5'

/**
 * A friend's profile (D-066): every card they share with the viewer, read-only. Their cards
 * never appear in the viewer's own notebook. The [friendId] segment is request data under
 * Cache Components: the page streams behind one skeleton.
 */
export default function FriendProfilePage({ params }: PageProps<'/[locale]/friends/[friendId]'>) {
  return (
    <div className="mx-auto grid w-full max-w-7xl content-start gap-6 px-[max(1rem,env(safe-area-inset-left))] pt-[max(0.5rem,env(safe-area-inset-top))] pb-12 md:px-8 md:pt-6">
      <Suspense
        fallback={
          <div className="grid gap-4">
            <Skeleton className="h-10 w-64" />
            <div className={gridClass}>
              <GoalCardSkeleton />
              <GoalCardSkeleton />
            </div>
          </div>
        }
      >
        <FriendProfile params={params} />
      </Suspense>
    </div>
  )
}

async function FriendProfile({
  params,
}: {
  params: PageProps<'/[locale]/friends/[friendId]'>['params']
}) {
  const { friendId } = await params
  await initLocale(params)
  const [t, format, viewer] = await Promise.all([
    getTranslations('friends'),
    getFormatter(),
    getViewer(),
  ])
  const friends = viewer && !viewer.isAnonymous ? await listFriends() : []
  const friend = z.uuid().safeParse(friendId).success
    ? friends.find((f) => f.id === friendId)
    : undefined
  const cards = friend ? await friendFeed(friends, friend.id) : []

  const back = (
    <Link
      href="/friends"
      className="inline-flex min-h-11 items-center gap-0.5 justify-self-start pr-2 font-extrabold text-accent-strong"
    >
      <ChevronLeft aria-hidden="true" className="size-5" />
      {t('profile.back')}
    </Link>
  )

  if (!friend) {
    return (
      <section className="grid justify-items-start gap-3">
        {back}
        <h1 className="font-display text-2xl font-extrabold">{t('profile.notFound')}</h1>
      </section>
    )
  }

  const name = friend.name ?? t('noName')
  return (
    <>
      {back}
      <header className="grid max-w-2xl gap-1">
        <h1 className="font-display text-3xl font-extrabold">{t('profile.title', { name })}</h1>
        <p className="text-md text-ink-2">
          {t('profile.count', { count: cards.length })} ·{' '}
          {t('profile.since', {
            date: format.dateTime(new Date(friend.since), { dateStyle: 'medium' }),
          })}
        </p>
      </header>
      {cards.length === 0 ? (
        <p className="max-w-2xl text-[0.9375rem] text-ink-2">{t('profile.empty', { name })}</p>
      ) : (
        <>
          <p className="flex max-w-2xl items-start gap-2 rounded-card border-2 border-dashed border-line-strong bg-card px-4 py-3 text-[0.9375rem] text-ink-2">
            <Eye aria-hidden="true" className="mt-0.5 size-5 shrink-0 stroke-[2.5] text-accent" />
            {t('profile.readOnly', { name })}
          </p>
          <ul className={gridClass}>
            {cards.map((goal) => (
              <li key={goal.id} className="grid">
                <GoalCard
                  size="compact"
                  href={`/friends/cards/${goal.id}`}
                  {...cardProps(goal)}
                  className="h-full"
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
