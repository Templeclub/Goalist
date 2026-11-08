import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { CaptureExamples } from '@/components/capture/CaptureTrigger'
import { GoalCard, GoalCardSkeleton } from '@/components/goal/GoalCard'
import { NotebookIllustration } from '@/components/ui/NotebookIllustration'
import { getViewer } from '@/features/auth/session'
import { listGoals } from '@/features/goals/queries'
import { initLocale } from '@/i18n/page-locale'
import { PageContainer } from '../page-container'

export async function generateMetadata({ params }: PageProps<'/[locale]/goals'>) {
  const locale = await initLocale(params)
  const t = await getTranslations({ locale, namespace: 'goals.list' })
  return { title: t('title') }
}

export default async function GoalsPage({ params }: PageProps<'/[locale]/goals'>) {
  await initLocale(params)
  const t = await getTranslations('goals.list')
  return (
    <PageContainer className="gap-6">
      <h1 className="font-display text-2xl font-medium">{t('title')}</h1>
      <Suspense
        fallback={
          <div className="grid gap-3.5 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <GoalCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <GoalList />
      </Suspense>
    </PageContainer>
  )
}

async function GoalList() {
  const [t, tHome, viewer] = await Promise.all([
    getTranslations('goals.list'),
    getTranslations('home.empty'),
    getViewer(),
  ])
  const goals = viewer ? await listGoals() : []

  if (goals.length === 0) {
    return (
      <section className="grid justify-items-center gap-4 py-6 text-center">
        <NotebookIllustration />
        <h2 className="font-display text-xl">{tHome('title')}</h2>
        <p className="max-w-[32ch] text-md text-ink-2">{tHome('body')}</p>
        <CaptureExamples />
      </section>
    )
  }

  return (
    <div className="grid gap-4">
      <p className="-mt-4 text-sm text-ink-3">{t('count', { count: goals.length })}</p>
      <div className="grid gap-3.5 md:grid-cols-2">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            size="compact"
            headingLevel="h2"
            href={`/goals/${goal.id}`}
            title={goal.title}
            tagline={goal.tagline}
            emoji={goal.emoji}
            categories={goal.categories}
            status={goal.status}
          />
        ))}
      </div>
    </div>
  )
}
