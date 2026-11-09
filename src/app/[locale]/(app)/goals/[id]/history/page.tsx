import { ChevronLeft } from 'lucide-react'
import { getFormatter, getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { z } from 'zod'
import { RestoreButton } from '@/components/sheet/RestoreButton'
import { Skeleton } from '@/components/ui/Skeleton'
import { getViewer } from '@/features/auth/session'
import { getGoal, listRevisions } from '@/features/goals/queries'
import { Link } from '@/i18n/navigation'
import { initLocale } from '@/i18n/page-locale'
import { PageContainer } from '../../../page-container'

export default function HistoryPage({ params }: PageProps<'/[locale]/goals/[id]/history'>) {
  return (
    <PageContainer className="gap-6">
      <Suspense fallback={<Skeleton className="h-48 w-full rounded-card" />}>
        <History params={params} />
      </Suspense>
    </PageContainer>
  )
}

async function History({
  params,
}: {
  params: PageProps<'/[locale]/goals/[id]/history'>['params']
}) {
  const { id } = await params
  await initLocale(params)
  const [t, format, viewer] = await Promise.all([
    getTranslations('goals.history'),
    getFormatter(),
    getViewer(),
  ])
  const goal = viewer && z.uuid().safeParse(id).success ? await getGoal(id) : null
  const tDetail = await getTranslations('goals.detail')
  if (!goal) {
    return <h1 className="font-display text-2xl font-bold">{tDetail('notFound')}</h1>
  }
  const revisions = await listRevisions(id)
  const now = new Date()

  return (
    <>
      <Link
        href={`/goals/${id}`}
        className="inline-flex min-h-11 items-center gap-0.5 font-semibold text-accent-strong"
      >
        <ChevronLeft aria-hidden="true" className="size-5" />
        {t('back')}
      </Link>
      <h1 className="font-display text-2xl font-bold">{t('title')}</h1>
      {revisions.length === 0 ? (
        <p className="text-md text-ink-2">{t('empty')}</p>
      ) : (
        <ol className="grid gap-3">
          {revisions.map((r) => (
            <li
              key={r.id}
              className="grid gap-2 rounded-card border border-card-border bg-card p-4 shadow-card"
            >
              <p className="text-sm text-ink-3">
                <time dateTime={r.createdAt}>
                  {format.relativeTime(new Date(r.createdAt), now)}
                </time>
                {' · '}
                {t(`reason.${r.reason as 'section_exit' | 'review' | 'interval' | 'restore'}`)}
              </p>
              <p className="font-display text-lg leading-snug">{r.title}</p>
              {r.excerpt && <p className="line-clamp-2 text-[0.9375rem] text-ink-2">{r.excerpt}</p>}
              <RestoreButton goalId={id} revisionId={r.id} />
            </li>
          ))}
        </ol>
      )}
    </>
  )
}
