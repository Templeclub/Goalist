import { connection } from 'next/server'
import { getFormatter, getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { CaptureExamples, CaptureTrigger } from '@/components/capture/CaptureTrigger'
import { GoalCard, GoalCardSkeleton } from '@/components/goal/GoalCard'
import { DismissButton } from '@/components/goals/DismissButton'
import { buttonVariants } from '@/components/ui/Button'
import { NotebookIllustration } from '@/components/ui/NotebookIllustration'
import { Skeleton } from '@/components/ui/Skeleton'
import { getViewer } from '@/features/auth/session'
import { getProfile, listGoals, listGoalsToComplete } from '@/features/goals/queries'
import { Link } from '@/i18n/navigation'
import { initLocale } from '@/i18n/page-locale'
import { cn } from '@/lib/cn'
import { AnonymousBanner } from '../anonymous-banner'
import { PageContainer } from '../page-container'

export default async function HomePage({ params }: PageProps<'/[locale]/home'>) {
  await initLocale(params)
  return (
    <PageContainer>
      <Suspense fallback={<HomeSkeleton />}>
        <HomeContent />
      </Suspense>
    </PageContainer>
  )
}

function HomeSkeleton() {
  return (
    <div className="grid gap-8" aria-hidden="true">
      <div className="grid gap-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-9 w-56" />
      </div>
      <Skeleton className="h-17 w-full rounded-2xl" />
      <div className="grid gap-3.5">
        <GoalCardSkeleton />
        <GoalCardSkeleton />
      </div>
    </div>
  )
}

async function HomeContent() {
  await connection()
  const [t, format, viewer] = await Promise.all([
    getTranslations('home'),
    getFormatter(),
    getViewer(),
  ])
  const [profile, recent, toComplete] = viewer
    ? await Promise.all([getProfile(), listGoals({ limit: 3 }), listGoalsToComplete({ limit: 3 })])
    : [null, [], { goals: [], total: 0 }]

  const now = new Date()
  const hour = Number(
    new Intl.DateTimeFormat('fr-FR', {
      hour: 'numeric',
      hourCycle: 'h23',
      timeZone: 'Europe/Paris',
    }).format(now),
  )
  const evening = hour >= 18 || hour < 5
  const name = profile?.display_name
  const greeting = name
    ? t(evening ? 'greeting.evening' : 'greeting.morning', { name })
    : t(evening ? 'greeting.eveningAnonymous' : 'greeting.morningAnonymous')

  return (
    <>
      <header className="grid gap-0.5">
        <p className="text-sm text-ink-3 first-letter:uppercase">{format.dateTime(now, 'long')}</p>
        <h1 className="font-display text-2xl font-medium tracking-[-0.01em]">{greeting}</h1>
      </header>

      {viewer?.isAnonymous && <AnonymousBanner />}

      <CaptureTrigger />

      {recent.length === 0 ? (
        <section className="grid justify-items-center gap-4 py-4 text-center">
          <NotebookIllustration />
          <h2 className="font-display text-xl">{t('empty.title')}</h2>
          <p className="max-w-[32ch] text-md text-ink-2">{t('empty.body')}</p>
          <CaptureExamples />
        </section>
      ) : (
        <section aria-labelledby="recent-title" className="grid gap-3">
          <div className="flex items-baseline justify-between">
            <h2 id="recent-title" className="label-caps">
              {t('recent.title')}
            </h2>
            <Link
              href="/goals"
              className="text-[0.9375rem] font-semibold text-accent-strong hover:underline"
            >
              {t('recent.seeAll')}
            </Link>
          </div>
          <div className="grid gap-3.5">
            {recent.map((goal) => (
              <GoalCard
                key={goal.id}
                href={`/goals/${goal.id}`}
                title={goal.title}
                tagline={goal.tagline}
                emoji={goal.emoji}
                categories={goal.categories}
                status={goal.status}
                hue={goal.ribbonHue}
              />
            ))}
          </div>
        </section>
      )}

      {toComplete.total > 0 && recent.length > 1 && (
        <section
          aria-labelledby="to-complete-title"
          className="grid gap-3 rounded-card bg-paper-2 p-4.5"
        >
          <h2 id="to-complete-title" className="label-caps">
            {t('toComplete.title')}
          </h2>
          <p className="text-[0.9375rem] text-ink-2">
            {t('toComplete.intro', { count: toComplete.total })}
          </p>
          <ul className="grid">
            {toComplete.goals.map((goal) => (
              <li
                key={goal.id}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-t border-line py-2.5"
              >
                <span aria-hidden="true" className="text-xl">
                  {goal.emoji || '·'}
                </span>
                <span className="min-w-0">
                  <b className="block leading-snug font-semibold">{goal.title}</b>
                  <small className="block text-sm text-ink-3">{t('toComplete.couldAdd')}</small>
                  <DismissButton goalId={goal.id} version={goal.version} title={goal.title} />
                </span>
                <Link
                  href={`/goals/${goal.id}`}
                  className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
                  aria-label={`${t('toComplete.action')} : ${goal.title}`}
                >
                  {t('toComplete.action')}
                </Link>
              </li>
            ))}
          </ul>
          {toComplete.total > toComplete.goals.length && (
            <Link
              href="/goals?quick=to_complete"
              className="text-[0.9375rem] font-semibold text-accent-strong underline-offset-2 hover:underline"
            >
              {t('toComplete.seeAll')}
            </Link>
          )}
        </section>
      )}
    </>
  )
}
