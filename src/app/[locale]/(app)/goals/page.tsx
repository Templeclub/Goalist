import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { CaptureExamples } from '@/components/capture/CaptureTrigger'
import { GoalCard, GoalCardSkeleton } from '@/components/goal/GoalCard'
import { DismissButton } from '@/components/goals/DismissButton'
import { GoalsToolbar } from '@/components/goals/GoalsToolbar'
import { MasterDetailList } from '@/components/goals/MasterDetailList'
import { NotebookIllustration } from '@/components/ui/NotebookIllustration'
import { Skeleton } from '@/components/ui/Skeleton'
import { getViewer } from '@/features/auth/session'
import {
  hasAnyFilter,
  listQueryToSearch,
  parseListQuery,
  type ListQuery,
} from '@/features/goals/list-query'
import {
  listCategories,
  searchGoals,
  type CategoryItem,
  type GoalSummary,
} from '@/features/goals/queries'
import { Link } from '@/i18n/navigation'
import { initLocale } from '@/i18n/page-locale'
import { cn } from '@/lib/cn'
import { GoalNotebook } from './goal-notebook'

export async function generateMetadata({ params }: PageProps<'/[locale]/goals'>) {
  const locale = await initLocale(params)
  const t = await getTranslations({ locale, namespace: 'goals.list' })
  return { title: t('title') }
}

export default async function GoalsPage({ params, searchParams }: PageProps<'/[locale]/goals'>) {
  await initLocale(params)
  const t = await getTranslations('goals.list')
  return (
    <div className="mx-auto w-full max-w-3xl px-[max(1.25rem,env(safe-area-inset-left))] pt-[max(1.5rem,env(safe-area-inset-top))] md:px-8 md:pt-10 lg:max-w-none lg:px-0 lg:pt-0">
      <Suspense
        fallback={
          <div className="grid gap-4 lg:max-w-[28rem] lg:px-6 lg:pt-8">
            <h1 className="font-display text-2xl font-medium">{t('title')}</h1>
            <Skeleton className="h-13 w-full rounded-md" />
            {[0, 1, 2].map((i) => (
              <GoalCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <GoalsView searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

const groupKey = (goal: GoalSummary, group: ListQuery['group']) =>
  group === 'status'
    ? goal.status
    : group === 'horizon'
      ? (goal.horizon ?? '')
      : group === 'category'
        ? (goal.categories[0] ?? '')
        : ''

async function GoalsView({
  searchParams,
}: {
  searchParams: PageProps<'/[locale]/goals'>['searchParams']
}) {
  const query = parseListQuery(await searchParams)
  const [t, tGoal, tHome, viewer] = await Promise.all([
    getTranslations('goals.list'),
    getTranslations('goal'),
    getTranslations('home.empty'),
    getViewer(),
  ])
  const [goals, categories]: [GoalSummary[], CategoryItem[]] = viewer
    ? await Promise.all([searchGoals(query), listCategories()])
    : [[], []]
  const filtered = hasAnyFilter(query)
  const search = listQueryToSearch({ ...query, open: undefined }).replace(/^\?/, '')

  if (!filtered && goals.length === 0) {
    return (
      <section className="grid justify-items-center gap-4 py-6 text-center lg:py-16">
        <h1 className="sr-only">{t('title')}</h1>
        <NotebookIllustration />
        <h2 className="font-display text-xl">{tHome('title')}</h2>
        <p className="max-w-[32ch] text-md text-ink-2">{tHome('body')}</p>
        <CaptureExamples />
      </section>
    )
  }

  const groupLabel = (key: string) => {
    if (query.group === 'status') return tGoal(`statuses.${key as GoalSummary['status']}`)
    if (query.group === 'horizon')
      return key ? tGoal(`horizon.${key as 'short'}`) : t('group.noHorizon')
    if (query.group === 'category')
      return key ? tGoal(`categories.${key as 'other'}`) : t('group.noCategory')
    return ''
  }
  const grouped = new Map<string, GoalSummary[]>()
  for (const goal of goals) {
    const key = groupKey(goal, query.group)
    grouped.set(key, [...(grouped.get(key) ?? []), goal])
  }

  const card = (goal: GoalSummary) => (
    <div key={goal.id} className="grid gap-1">
      <GoalCard
        size="compact"
        headingLevel={query.group === 'none' ? 'h2' : 'h3'}
        href={`/goals/${goal.id}`}
        title={goal.title}
        tagline={goal.tagline}
        emoji={goal.emoji}
        categories={goal.categories}
        status={goal.status}
        hue={goal.ribbonHue}
        className={cn(query.open === goal.id && 'lg:outline-2 lg:outline-accent')}
      />
      {query.quick.includes('to_complete') && !goal.completionDismissed && (
        <DismissButton goalId={goal.id} version={goal.version} title={goal.title} />
      )}
    </div>
  )

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[28rem_minmax(0,1fr)]">
      <div className="grid content-start gap-5 lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:border-r lg:border-line lg:px-6 lg:pt-8 lg:pb-10">
        <h1 className="font-display text-2xl font-medium">{t('title')}</h1>
        <GoalsToolbar query={query} categories={categories} />
        <p className="text-sm text-ink-3" aria-live="polite">
          {t('count', { count: goals.length })}
        </p>
        {goals.length === 0 ? (
          <div className="grid justify-items-start gap-3 rounded-card bg-paper-2 p-5">
            <p className="text-md text-ink-2">{t('noResults')}</p>
            <Link
              href="/goals"
              className="font-semibold text-accent-strong underline-offset-2 hover:underline"
            >
              {t('clearAll')}
            </Link>
          </div>
        ) : (
          <MasterDetailList search={search}>
            <div className="grid gap-6">
              {[...grouped.entries()].map(([key, list]) =>
                query.group === 'none' ? (
                  <div key="all" className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-1">
                    {list.map(card)}
                  </div>
                ) : (
                  <section
                    key={key}
                    aria-labelledby={`group-${key || 'none'}`}
                    className="grid gap-3"
                  >
                    <h2 id={`group-${key || 'none'}`} className="label-caps">
                      {`${groupLabel(key)} · ${list.length}`}
                    </h2>
                    <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-1">
                      {list.map(card)}
                    </div>
                  </section>
                ),
              )}
            </div>
          </MasterDetailList>
        )}
      </div>

      <div className="paper-dots hidden min-w-0 lg:block">
        {query.open ? (
          <Suspense fallback={<Skeleton className="m-10 h-40 rounded-card" />}>
            <GoalNotebook key={query.open} id={query.open} embedded />
          </Suspense>
        ) : (
          <p className="grid h-full place-items-center px-10 text-md text-ink-3">{t('choose')}</p>
        )}
      </div>
    </div>
  )
}
