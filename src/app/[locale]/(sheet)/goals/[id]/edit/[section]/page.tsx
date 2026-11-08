import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { z } from 'zod'
import { SheetEditor, type SheetData } from '@/components/sheet/SheetEditor'
import { Skeleton } from '@/components/ui/Skeleton'
import { getViewer } from '@/features/auth/session'
import { getGoalSheet, listCategories, listTagLabels } from '@/features/goals/queries'
import { RichDoc } from '@/features/goals/rich-text'
import { isFlowSection } from '@/features/goals/sections'
import { initLocale } from '@/i18n/page-locale'

/** "Donner vie à cette envie" — has its own chrome, outside the app navigation. */
export default function SheetPage({ params }: PageProps<'/[locale]/goals/[id]/edit/[section]'>) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto grid max-w-[40rem] gap-5 px-5 pt-20" aria-hidden="true">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-28 w-full rounded-md" />
          <Skeleton className="h-14 w-full rounded-md" />
        </div>
      }
    >
      <Sheet params={params} />
    </Suspense>
  )
}

async function Sheet({
  params,
}: {
  params: PageProps<'/[locale]/goals/[id]/edit/[section]'>['params']
}) {
  const { id, section } = await params
  await initLocale(params)
  if (!isFlowSection(section) || !z.uuid().safeParse(id).success) notFound()
  const viewer = await getViewer()
  const goal = viewer ? await getGoalSheet(id) : null
  if (!goal) notFound()

  const doc = RichDoc.safeParse(goal.descriptionDoc)
  const data: SheetData = {
    id: goal.id,
    version: goal.version,
    title: goal.title,
    tagline: goal.tagline,
    emoji: goal.emoji,
    hue: goal.hue as SheetData['hue'],
    categories: goal.categories,
    status: goal.status,
    descriptionDoc: doc.success ? doc.data : null,
    imaginedOutcome: goal.imaginedOutcome,
    whereWith: goal.whereWith,
    why: goal.why,
    benefits: goal.benefits,
    firstStep: goal.firstStep,
    notes: goal.notes,
    valueKeys: goal.valueKeys as SheetData['valueKeys'],
    customValues: goal.customValues,
    media: goal.media,
    qualify: goal.qualify,
    categoryItems: goal.categoryItems,
    tags: goal.tags,
    smart: goal.smart,
    statusNote: goal.statusNote,
  }
  const [availableCategories, tagSuggestions] =
    section === 'qualify' ? await Promise.all([listCategories(), listTagLabels()]) : [[], []]

  return (
    <SheetEditor
      // Next keeps visited routes alive (React Activity): a newer server version
      // (restore, edit elsewhere) must remount the form, never show stale state.
      key={`${goal.id}-${section}-${goal.version}`}
      data={data}
      section={section}
      canUploadImages={!viewer!.isAnonymous}
      availableCategories={availableCategories}
      tagSuggestions={tagSuggestions}
    />
  )
}
