import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'
import { initLocale } from '@/i18n/page-locale'
import { GoalNotebook } from '../goal-notebook'

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

async function GoalDetail({ params }: { params: PageProps<'/[locale]/goals/[id]'>['params'] }) {
  const { id } = await params
  await initLocale(params)
  return <GoalNotebook id={id} />
}
