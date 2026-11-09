import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { GoalCard, GoalCardSkeleton } from '@/components/goal/GoalCard'
import { cardProps } from '@/components/goal/card-props'
import { toneProps } from '@/components/goal/tone'
import { buttonVariants } from '@/components/ui/Button'
import { getViewer } from '@/features/auth/session'
import { categoryHue } from '@/features/goals/palette'
import { listCollection } from '@/features/goals/queries'
import type { CategoryKey } from '@/features/goals/schema'
import { Link } from '@/i18n/navigation'
import { initLocale } from '@/i18n/page-locale'

export async function generateMetadata({ params }: PageProps<'/[locale]/collection'>) {
  const locale = await initLocale(params)
  const t = await getTranslations({ locale, namespace: 'goals.collection' })
  return { title: t('title') }
}

const gridClass = 'grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5'

/** The binder of acquired cards, numbered in the order they were acquired (D-062). */
export default async function CollectionPage({ params }: PageProps<'/[locale]/collection'>) {
  await initLocale(params)
  const t = await getTranslations('goals.collection')
  return (
    <div className="mx-auto grid w-full max-w-7xl content-start gap-6 px-[max(1rem,env(safe-area-inset-left))] pt-[max(1.5rem,env(safe-area-inset-top))] pb-12 md:px-8 md:pt-10">
      <h1 className="font-display text-3xl font-extrabold">{t('title')}</h1>
      <Suspense
        fallback={
          <div className={gridClass}>
            {[0, 1, 2, 3].map((i) => (
              <GoalCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <CollectionView />
      </Suspense>
    </div>
  )
}

async function CollectionView() {
  const [t, tGoal, viewer] = await Promise.all([
    getTranslations('goals.collection'),
    getTranslations('goal'),
    getViewer(),
  ])
  const { acquired, stored } = viewer ? await listCollection() : { acquired: [], stored: [] }

  const series = new Map<string, { label: string; hue: number | null; count: number }>()
  for (const goal of acquired) {
    const key = goal.categories[0] ?? goal.customCategory?.label ?? ''
    const label = goal.categories[0]
      ? tGoal(`categories.${goal.categories[0] as CategoryKey}`)
      : (goal.customCategory?.label ?? tGoal('card.noSeries'))
    const hue = goal.categories[0]
      ? categoryHue[goal.categories[0] as CategoryKey]
      : (goal.customCategory?.hue ?? null)
    const entry = series.get(key) ?? { label, hue, count: 0 }
    series.set(key, { ...entry, count: entry.count + 1 })
  }

  return (
    <>
      <p className="-mt-3 text-md font-bold text-ink-2" aria-live="polite">
        {t('count', { count: acquired.length })}
      </p>

      {acquired.length === 0 ? (
        <section className="grid max-w-xl justify-items-start gap-3 rounded-card border-[3px] border-dashed border-line-strong bg-card p-6">
          <h2 className="font-display text-xl font-extrabold">{t('emptyTitle')}</h2>
          <p className="text-md text-ink-2">{t('emptyBody')}</p>
          <Link href="/goals" className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
            {t('toDeck')}
          </Link>
        </section>
      ) : (
        <>
          <section aria-labelledby="series-title" className="grid gap-2.5">
            <h2 id="series-title" className="label-caps">
              {t('series')}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {[...series.values()]
                .toSorted((a, b) => b.count - a.count)
                .map((s) => (
                  <li
                    key={s.label}
                    {...toneProps(s.hue)}
                    className="inline-flex min-h-9 items-center gap-2 rounded-full border-2 border-outline bg-tone-bg px-3 text-sm font-extrabold text-tone-fg"
                  >
                    <span
                      aria-hidden="true"
                      className="size-3 rounded-[4px] border-2 border-outline bg-tone-ribbon"
                    />
                    {t('seriesCount', { label: s.label, count: s.count })}
                  </li>
                ))}
            </ul>
          </section>

          <section
            aria-labelledby="binder-title"
            className="grid gap-3 rounded-sheet border-[3px] border-outline bg-paper-2 p-3 sm:p-5"
          >
            <h2 id="binder-title" className="label-caps">
              {t('binder')}
            </h2>
            <div className={gridClass}>
              {acquired.map((goal) => (
                <GoalCard
                  key={goal.id}
                  size="compact"
                  href={`/goals/${goal.id}`}
                  {...cardProps(goal, goal.number)}
                  className="h-full"
                />
              ))}
              <div className="grid min-h-48 place-items-center rounded-card border-[3px] border-dashed border-line-strong p-3 text-center text-sm font-bold text-ink-3">
                {t('next')}
              </div>
            </div>
          </section>
        </>
      )}

      {stored.length > 0 && (
        <details className="group grid gap-3">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 font-extrabold [&::-webkit-details-marker]:hidden">
            {t('stored', { count: stored.length })}
          </summary>
          <p className="text-sm text-ink-2">{t('storedHint')}</p>
          <div className={`${gridClass} pt-3`}>
            {stored.map((goal) => (
              <GoalCard
                key={goal.id}
                size="compact"
                href={`/goals/${goal.id}`}
                {...cardProps(goal)}
                className="h-full"
              />
            ))}
          </div>
        </details>
      )}
    </>
  )
}
