import { ChevronLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { z } from 'zod'
import { GoalNameEditor } from '@/components/goal/GoalNameEditor'
import { StatusPill } from '@/components/goal/StatusPill'
import { toneProps } from '@/components/goal/tone'
import { Skeleton } from '@/components/ui/Skeleton'
import { categoryHue } from '@/features/goals/palette'
import { getViewer } from '@/features/auth/session'
import { getGoal } from '@/features/goals/queries'
import { Link } from '@/i18n/navigation'
import { initLocale } from '@/i18n/page-locale'

/**
 * The [id] segment is request data under Cache Components: the whole page,
 * translated back link included, streams behind one skeleton.
 */
export default function GoalPage({ params }: PageProps<'/[locale]/goals/[id]'>) {
  return (
    <div className="paper-dots min-h-dvh">
      <Suspense
        fallback={
          <div className="mx-auto grid max-w-3xl gap-4 px-6 pt-16 md:px-10" aria-hidden="true">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-6 w-3/5" />
          </div>
        }
      >
        <GoalDetail params={params} />
      </Suspense>
    </div>
  )
}

function BackLink({ label }: { label: string }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-[max(0.5rem,env(safe-area-inset-left))] pt-[max(0.5rem,env(safe-area-inset-top))] md:px-6 md:pt-6">
      <Link
        href="/goals"
        className="inline-flex min-h-11 items-center gap-0.5 pr-2 font-semibold text-accent-strong"
      >
        <ChevronLeft aria-hidden="true" className="size-5" />
        {label}
      </Link>
    </div>
  )
}

async function GoalDetail({ params }: { params: PageProps<'/[locale]/goals/[id]'>['params'] }) {
  const { id } = await params
  await initLocale(params)
  const [t, viewer] = await Promise.all([getTranslations('goals.detail'), getViewer()])
  const goal = viewer && z.uuid().safeParse(id).success ? await getGoal(id) : null

  if (!goal) {
    return (
      <>
        <BackLink label={t('back')} />
        <section className="mx-auto grid max-w-3xl justify-items-start gap-4 px-6 pt-12 md:px-10">
          <h1 className="font-display text-2xl font-medium">{t('notFound')}</h1>
          <Link
            href="/goals"
            className="font-semibold text-accent-strong underline-offset-2 hover:underline"
          >
            {t('toList')}
          </Link>
        </section>
      </>
    )
  }

  const first = goal.categories[0]
  return (
    <>
      <BackLink label={t('back')} />
      <article className="relative mx-auto grid max-w-3xl gap-6 px-6 pt-6 pb-16 md:px-10">
        <span
          {...toneProps(first ? categoryHue[first] : null)}
          aria-hidden="true"
          className="signet absolute top-0 right-7 h-22 w-5.5"
        />
        <div className="pr-10">
          <GoalNameEditor
            key={goal.id}
            goalId={goal.id}
            version={goal.version}
            title={goal.title}
            tagline={goal.tagline}
            emoji={goal.emoji}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill status={goal.status} />
          <p className="text-sm text-ink-3">{t('keptOn', { date: new Date(goal.createdAt) })}</p>
        </div>
      </article>
    </>
  )
}
