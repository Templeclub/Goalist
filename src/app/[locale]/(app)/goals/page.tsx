import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { CaptureExamples } from '@/components/capture/CaptureTrigger'
import { GoalCard, GoalCardSkeleton } from '@/components/goal/GoalCard'
import { cardProps } from '@/components/goal/card-props'
import { DismissButton } from '@/components/goals/DismissButton'
import { GoalsToolbar } from '@/components/goals/GoalsToolbar'
import { NotebookIllustration } from '@/components/ui/NotebookIllustration'
import { Skeleton } from '@/components/ui/Skeleton'
import { getViewer } from '@/features/auth/session'
import { hasAnyFilter, parseListQuery, type ListQuery } from '@/features/goals/list-query'
import {
  listCategories,
  searchGoals,
  type CategoryItem,
  type GoalSummary,
} from '@/features/goals/queries'
import { horizons } from '@/features/goals/schema'
import { Link } from '@/i18n/navigation'
import { initLocale } from '@/i18n/page-locale'

export async function generateMetadata({ params }: PageProps<'/[locale]/goals'>) {
  const locale = await initLocale(params)
  const t = await getTranslations({ locale, namespace: 'goals.list' })
  return { title: t('title') }
}

export default async function GoalsPage({ params, searchParams }: PageProps<'/[locale]/goals'>) {
  await initLocale(params)
  const t = await getTranslations('goals.list')
  return (
    <div className="mx-auto w-full max-w-7xl px-[max(1rem,env(safe-area-inset-left))] pt-[max(1.5rem,env(safe-area-inset-top))] pb-10 md:px-8 md:pt-10">
      <Suspense
        fallback={
          <div className="grid gap-4">
            <h1 className="font-display text-3xl font-extrabold">{t('title')}</h1>
            <Skeleton className="h-13 w-full max-w-2xl rounded-md" />
            <div className={gridClass}>
              {[0, 1, 2, 3].map((i) => (
                <GoalCardSkeleton key={i} />
              ))}
            </div>
          </div>
        }
      >
        <GoalsView searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

/** Two cards per row on a phone, up to five on a wide screen (D-061). */
const gridClass = 'grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5'

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
      return key ? tGoal(`horizonGroup.${key as 'short'}`) : t('group.noHorizon')
    if (query.group === 'category')
      return key ? tGoal(`categories.${key as 'other'}`) : t('group.noCategory')
    return ''
  }
  const grouped = new Map<string, GoalSummary[]>(
    // Horizon groups always read from the nearest to "un jour".
    query.group === 'horizon' ? [...horizons, ''].map((h) => [h, []]) : [],
  )
  for (const goal of goals) {
    const key = groupKey(goal, query.group)
    grouped.set(key, [...(grouped.get(key) ?? []), goal])
  }
  for (const [key, list] of grouped) if (list.length === 0) grouped.delete(key)

  const card = (goal: GoalSummary) => (
    <div key={goal.id} className="grid content-start gap-1">
      <GoalCard
        size="compact"
        headingLevel={query.group === 'none' ? 'h2' : 'h3'}
        href={`/goals/${goal.id}`}
        {...cardProps(goal)}
        className="h-full"
      />
      {query.quick.includes('to_complete') && !goal.completionDismissed && (
        <DismissButton goalId={goal.id} version={goal.version} title={goal.title} />
      )}
    </div>
  )

  return (
    <div className="grid content-start gap-5">
      <h1 className="font-display text-3xl font-extrabold">{t('title')}</h1>
      <div className="max-w-2xl">
        <GoalsToolbar query={query} categories={categories} />
      </div>
      <p className="text-sm text-ink-3" aria-live="polite">
        {t('count', { count: goals.length })}
      </p>
      {goals.length === 0 ? (
        <div className="grid max-w-2xl justify-items-start gap-3 rounded-card bg-paper-2 p-5">
          <p className="text-md text-ink-2">{t('noResults')}</p>
          <Link
            href="/goals"
            className="font-semibold text-accent-strong underline-offset-2 hover:underline"
          >
            {t('clearAll')}
          </Link>
        </div>
      ) : (
        <div className="grid gap-7">
          {[...grouped.entries()].map(([key, list]) =>
            query.group === 'none' ? (
              <div key="all" className={gridClass}>
                {list.map(card)}
              </div>
            ) : (
              <section key={key} aria-labelledby={`group-${key || 'none'}`} className="grid gap-3">
                <h2 id={`group-${key || 'none'}`} className="label-caps">
                  {`${groupLabel(key)} · ${list.length}`}
                </h2>
                <div className={gridClass}>{list.map(card)}</div>
              </section>
            ),
          )}
        </div>
      )}
    </div>
  )
}
