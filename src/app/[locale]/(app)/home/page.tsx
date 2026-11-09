import { connection } from 'next/server'
import { getFormatter, getTranslations } from 'next-intl/server'
import { ChevronRight, Hourglass, Sparkle, Star } from 'lucide-react'
import { Suspense, type CSSProperties } from 'react'
import { CaptureExamples, CaptureTrigger } from '@/components/capture/CaptureTrigger'
import { GoalCard, GoalCardSkeleton } from '@/components/goal/GoalCard'
import { cardProps } from '@/components/goal/card-props'
import { NotebookIllustration } from '@/components/ui/NotebookIllustration'
import { Skeleton } from '@/components/ui/Skeleton'
import { getViewer } from '@/features/auth/session'
import {
  acquiredNumber,
  getProfile,
  homeRecommendations,
  listGoalsToComplete,
} from '@/features/goals/queries'
import { Link } from '@/i18n/navigation'
import { initLocale } from '@/i18n/page-locale'
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

const rowClass =
  'flex min-h-13 items-center gap-3 border-t-2 border-dashed border-line px-4 py-2.5 font-bold hover:bg-paper-2'

async function HomeContent() {
  await connection()
  const [t, format, viewer] = await Promise.all([
    getTranslations('home'),
    getFormatter(),
    getViewer(),
  ])
  const [profile, rec, toComplete] = viewer
    ? await Promise.all([getProfile(), homeRecommendations(), listGoalsToComplete({ limit: 3 })])
    : [
        null,
        { total: 0, soon: [], recent: [], prepare: [], lastAcquired: null },
        { goals: [], total: 0 },
      ]
  const lastNumber = rec.lastAcquired ? await acquiredNumber(rec.lastAcquired) : undefined

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
        <h1 className="font-display text-2xl font-bold tracking-[-0.01em]">{greeting}</h1>
      </header>

      {viewer?.isAnonymous && <AnonymousBanner />}

      <CaptureTrigger />

      {rec.total === 0 && !rec.lastAcquired ? (
        <section className="grid justify-items-center gap-4 py-4 text-center">
          <NotebookIllustration />
          <h2 className="font-display text-xl font-extrabold">{t('empty.title')}</h2>
          <p className="max-w-[32ch] text-md text-ink-2">{t('empty.body')}</p>
          <CaptureExamples />
        </section>
      ) : (
        <>
          <section aria-labelledby="soon-title" className="grid gap-3">
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="soon-title" className="font-display text-xl font-extrabold">
                {rec.soon.length > 0 ? t('soon.title') : t('recent.title')}
              </h2>
              <Link
                href="/goals"
                className="text-[0.9375rem] font-extrabold text-accent-strong hover:underline"
              >
                {t('soon.seeAll')}
              </Link>
            </div>
            <p className="-mt-2 text-[0.9375rem] text-ink-2">
              {rec.soon.length > 0 ? t('soon.intro') : t('soon.empty')}
            </p>
            {(rec.soon.length > 0 ? rec.soon : rec.recent).length > 0 && (
              <ul className="fan -mx-5 flex overflow-x-auto px-8 pt-6 pb-8 md:mx-0 md:px-6">
                {(rec.soon.length > 0 ? rec.soon : rec.recent).map((goal, i, list) => (
                  <li
                    key={goal.id}
                    className="w-40 shrink-0 md:w-48"
                    style={
                      {
                        '--fan-r': `${(i - (list.length - 1) / 2) * 5}deg`,
                        '--fan-y': `${Math.abs(i - (list.length - 1) / 2) * 6}px`,
                      } as CSSProperties
                    }
                  >
                    <GoalCard
                      size="compact"
                      href={`/goals/${goal.id}`}
                      {...cardProps(goal)}
                      className="h-full"
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {(rec.prepare.length > 0 || toComplete.total > 0 || rec.lastAcquired) && (
        <nav
          aria-labelledby="more-title"
          className="grid rounded-card border-[3px] border-outline bg-card shadow-card"
        >
          <h2 id="more-title" className="px-4 pt-3.5 pb-1 label-caps">
            {t('more.title')}
          </h2>
          <ul className="grid">
            {rec.prepare.length > 0 && (
              <li>
                <Link href="/goals?quick=prepare_early" className={rowClass}>
                  <Hourglass
                    aria-hidden="true"
                    className="size-5 shrink-0 stroke-[2.5] text-accent"
                  />
                  <span className="flex-1">{t('more.prepare', { count: rec.prepare.length })}</span>
                  <ChevronRight aria-hidden="true" className="size-5 text-ink-3" />
                </Link>
              </li>
            )}
            {toComplete.total > 0 && (
              <li>
                <Link href="/goals?quick=to_complete" className={rowClass}>
                  <Sparkle
                    aria-hidden="true"
                    className="size-5 shrink-0 stroke-[2.5] text-accent"
                  />
                  <span className="flex-1">{t('more.reveal', { count: toComplete.total })}</span>
                  <ChevronRight aria-hidden="true" className="size-5 text-ink-3" />
                </Link>
              </li>
            )}
            {rec.lastAcquired && (
              <li>
                <Link href={`/goals/${rec.lastAcquired.id}`} className={rowClass}>
                  <Star aria-hidden="true" className="size-5 shrink-0 stroke-[2.5] text-accent" />
                  <span className="flex-1">
                    {t('more.last', {
                      title: rec.lastAcquired.title,
                      number: String(lastNumber ?? 1).padStart(3, '0'),
                    })}
                  </span>
                  <ChevronRight aria-hidden="true" className="size-5 text-ink-3" />
                </Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </>
  )
}
