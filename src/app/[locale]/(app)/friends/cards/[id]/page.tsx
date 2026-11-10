import { ChevronLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Suspense, type ReactNode } from 'react'
import { z } from 'zod'
import { CommentThread } from '@/components/friends/CommentThread'
import { FriendCardInteractions } from '@/components/friends/FriendCardInteractions'
import { GoalCard } from '@/components/goal/GoalCard'
import { cardProps } from '@/components/goal/card-props'
import { RichTextView } from '@/components/sheet/RichTextView'
import { Skeleton } from '@/components/ui/Skeleton'
import { getViewer } from '@/features/auth/session'
import { cardSocial, getFriendCard, listFriends } from '@/features/friends/queries'
import { Link } from '@/i18n/navigation'
import { initLocale } from '@/i18n/page-locale'

/**
 * A card a friend shared, with encouragements, « moi aussi », help and messages (D-064).
 * The [id] segment is request data under Cache Components: the page streams behind one skeleton.
 */
export default function FriendCardPage({ params }: PageProps<'/[locale]/friends/cards/[id]'>) {
  return (
    <div className="mx-auto grid w-full max-w-2xl content-start gap-5 px-[max(1rem,env(safe-area-inset-left))] pt-[max(0.5rem,env(safe-area-inset-top))] pb-36 md:px-8 md:pt-6 md:pb-16">
      <Suspense fallback={<Skeleton className="mx-auto mt-12 h-96 w-full max-w-sm rounded-card" />}>
        <FriendCardView params={params} />
      </Suspense>
    </div>
  )
}

async function FriendCardView({
  params,
}: {
  params: PageProps<'/[locale]/friends/cards/[id]'>['params']
}) {
  const { id } = await params
  await initLocale(params)
  const [t, tDetail, viewer] = await Promise.all([
    getTranslations('friends'),
    getTranslations('goals.detail'),
    getViewer(),
  ])
  const friends = viewer && !viewer.isAnonymous ? await listFriends() : []
  const card = viewer && z.uuid().safeParse(id).success ? await getFriendCard(id, friends) : null

  const back = (
    <Link
      href="/friends"
      className="inline-flex min-h-11 items-center gap-0.5 justify-self-start pr-2 font-extrabold text-accent-strong"
    >
      <ChevronLeft aria-hidden="true" className="size-5" />
      {t('card.back')}
    </Link>
  )

  if (!viewer || !card) {
    return (
      <section className="grid justify-items-start gap-3">
        <h1 className="font-display text-2xl font-extrabold">{tDetail('notFound')}</h1>
        <Link href="/friends" className="font-extrabold text-accent-strong underline">
          {t('card.back')}
        </Link>
      </section>
    )
  }

  const social = await cardSocial(card.id, viewer.id, friends)
  const block = (title: string, children: ReactNode) => (
    <section className="grid gap-2 border-t-2 border-dashed border-line pt-3">
      <h2 className="label-caps">{title}</h2>
      {children}
    </section>
  )

  return (
    <>
      {back}
      <p className="grid justify-items-center gap-0.5 text-center">
        <Link
          href={`/friends/${card.ownerId}`}
          className="inline-flex min-h-11 items-center font-extrabold text-accent-strong hover:underline"
        >
          {t('card.owner', { name: card.ownerName ?? t('noName') })}
        </Link>
        <span className="text-sm text-ink-2">
          {t('card.readOnly', { name: card.ownerName ?? t('noName') })}
        </span>
      </p>
      <GoalCard
        size="hero"
        headingLevel="h1"
        className="mx-auto w-full max-w-sm"
        {...cardProps(card)}
      />
      <FriendCardInteractions
        goalId={card.id}
        title={card.title}
        social={{
          reactions: social.reactions,
          mine: social.mine,
          meToo: social.meToo,
          offers: social.offers,
        }}
      />
      {card.why && block(t('card.why'), <p className="text-md whitespace-pre-line">{card.why}</p>)}
      {card.firstStep &&
        block(
          t('card.firstStep'),
          <p className="font-display text-lg font-bold">{card.firstStep}</p>,
        )}
      {card.descriptionDoc &&
        block(t('card.description'), <RichTextView doc={card.descriptionDoc} />)}
      <CommentThread goalId={card.id} userId={viewer.id} initial={social.comments} />
    </>
  )
}
