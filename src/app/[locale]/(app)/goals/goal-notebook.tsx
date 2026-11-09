import { ChevronDown, ChevronLeft, Clock, Hourglass } from 'lucide-react'
import { getFormatter, getTranslations } from 'next-intl/server'
import { z } from 'zod'
import { CategoryPill } from '@/components/goal/CategoryPill'
import { StatusPill } from '@/components/goal/StatusPill'
import { toneProps } from '@/components/goal/tone'
import { RichTextView } from '@/components/sheet/RichTextView'
import { buttonVariants } from '@/components/ui/Button'
import { getViewer } from '@/features/auth/session'
import { categoryHue } from '@/features/goals/palette'
import { getGoalSheet } from '@/features/goals/queries'
import { RichDoc } from '@/features/goals/rich-text'
import type { ValueKey } from '@/features/goals/schema'
import { needsEarlyStart } from '@/features/goals/priority'
import type { Horizon } from '@/features/goals/schema'
import { firstSectionToComplete, sectionForMissing } from '@/features/goals/sections'
import { factRows } from './[id]/facts'
import { Link } from '@/i18n/navigation'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

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

/**
 * The notebook page of a wish. Used by /goals/[id] and, embedded, by the
 * desktop master-detail of /goals (D-053). Call inside <Suspense> after initLocale.
 */
export async function GoalNotebook({ id, embedded = false }: { id: string; embedded?: boolean }) {
  const [t, tGoal, tFlow, format, viewer] = await Promise.all([
    getTranslations('goals.detail'),
    getTranslations('goal'),
    getTranslations('flow'),
    getFormatter(),
    getViewer(),
  ])
  const goal = viewer && z.uuid().safeParse(id).success ? await getGoalSheet(id) : null

  if (!goal) {
    return (
      <>
        {!embedded && <BackLink label={t('back')} />}
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

  const firstCategory = goal.categoryItems[0]
  const facts = factRows(goal.qualify, tGoal, format)
  const doc = RichDoc.safeParse(goal.descriptionDoc)
  const hasImagine = doc.success || goal.imaginedOutcome || goal.whereWith
  const hasWhy =
    goal.why || goal.benefits || goal.valueKeys.length > 0 || goal.customValues.length > 0
  const toComplete = [
    ...new Set(goal.missingSections.map((m) => sectionForMissing[m]).filter(Boolean)),
  ] as NonNullable<(typeof sectionForMissing)[string]>[]
  const completeHref = `/goals/${goal.id}/edit/${firstSectionToComplete(goal.missingSections)}`
  const early = needsEarlyStart({
    horizon: goal.qualify.horizon,
    preparation: goal.qualify.preparation,
    status: goal.status,
  })

  const section = (title: string, children: ReactNode) => (
    <details open className="group border-t border-line pt-3">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
        <h2 className="label-caps">{title}</h2>
        <ChevronDown
          aria-hidden="true"
          className="size-4 text-ink-3 transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="grid gap-3 pt-2">{children}</div>
    </details>
  )

  return (
    <>
      {!embedded && <BackLink label={t('back')} />}
      <article className="relative mx-auto grid max-w-3xl gap-6 px-6 pt-6 pb-36 md:px-10 md:pb-16">
        <span
          {...toneProps(
            firstCategory
              ? firstCategory.key
                ? categoryHue[firstCategory.key]
                : firstCategory.hue
              : goal.hue,
          )}
          aria-hidden="true"
          className="signet absolute top-0 right-7 h-22 w-5.5"
        />
        <header className="grid gap-3 pr-10">
          {goal.emoji && (
            <span aria-hidden="true" className="text-[2.625rem] leading-none">
              {goal.emoji}
            </span>
          )}
          <h1 className="font-display text-3xl font-medium tracking-[-0.015em]">{goal.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={goal.status} />
            {goal.categoryItems.map((c) =>
              c.key ? (
                <CategoryPill key={c.id} category={c.key} />
              ) : (
                <CategoryPill key={c.id} custom={{ label: c.label ?? '', hue: c.hue }} />
              ),
            )}
            {goal.qualify.horizon && (
              <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-line-strong px-2.5 py-0.5 text-sm font-semibold text-ink-2">
                <Clock aria-hidden="true" className="size-4" />
                {tGoal(`horizonShort.${goal.qualify.horizon as Horizon}`)}
              </span>
            )}
            {early && (
              <span
                {...toneProps('accent')}
                className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-tone-bg px-2.5 py-0.5 text-sm font-semibold text-tone-fg"
              >
                <Hourglass aria-hidden="true" className="size-4" />
                {tGoal('card.prepareEarly')}
              </span>
            )}
          </div>
        </header>

        {goal.status === 'let_go' && (
          <div className="grid gap-1 rounded-card bg-paper-2 px-4.5 py-4">
            <p className="text-md text-ink-2">{t('letGo')}</p>
            {goal.statusNote && <p className="font-display text-lg italic">{goal.statusNote}</p>}
          </div>
        )}

        {goal.completenessLevel === 'sketch' && !hasImagine && !hasWhy && !goal.firstStep && (
          <p className="max-w-[48ch] text-md text-ink-2">{t('sketchInvite')}</p>
        )}

        {hasImagine &&
          section(
            t('imagine'),
            <>
              {doc.success && <RichTextView doc={doc.data} />}
              {goal.imaginedOutcome && (
                <p className="max-w-[65ch] text-md whitespace-pre-line">{goal.imaginedOutcome}</p>
              )}
              {goal.whereWith && (
                <p className="text-[0.9375rem] text-ink-2">
                  <b className="font-semibold text-ink">{t('whereWith')}</b> {goal.whereWith}
                </p>
              )}
            </>,
          )}

        {goal.media.length > 0 &&
          section(
            t('inspiration'),
            <ul className="flex flex-wrap gap-2.5">
              {goal.media.map((m) => (
                <li key={m.id}>
                  {m.kind === 'image' && m.src ? (
                    // eslint-disable-next-line @next/next/no-img-element -- private image behind a signed URL
                    <img
                      src={m.src}
                      alt={m.altText ?? tFlow('describe.imageLabel')}
                      className="h-32 w-48 rounded-[10px] object-cover"
                    />
                  ) : m.url ? (
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      aria-label={t('openLink', { title: m.title ?? m.url })}
                      className="inline-flex min-h-11 items-center rounded-full border border-line-strong bg-card px-4 text-[0.9375rem] text-accent-strong underline-offset-2 hover:underline"
                    >
                      {m.title ?? m.url.replace(/^https?:\/\//, '')}
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>,
          )}

        {hasWhy &&
          section(
            t('whyTitle'),
            <>
              {goal.why && <p className="max-w-[65ch] text-md whitespace-pre-line">{goal.why}</p>}
              {(goal.valueKeys.length > 0 || goal.customValues.length > 0) && (
                <ul className="flex flex-wrap gap-1.5">
                  {goal.valueKeys.map((k) => (
                    <li
                      key={k}
                      className="rounded-full border border-line-strong px-2.5 py-0.5 text-sm text-ink-2"
                    >
                      {tGoal(`values.${k as ValueKey}`)}
                    </li>
                  ))}
                  {goal.customValues.map((v) => (
                    <li
                      key={v}
                      className="rounded-full border border-line-strong px-2.5 py-0.5 text-sm text-ink-2"
                    >
                      {v}
                    </li>
                  ))}
                </ul>
              )}
              {goal.benefits && (
                <p className="max-w-[65ch] text-[0.9375rem] whitespace-pre-line text-ink-2">
                  {goal.benefits}
                </p>
              )}
            </>,
          )}

        {goal.smart.achievable &&
          section(
            t('plan'),
            <p className="max-w-[65ch] text-md whitespace-pre-line">{goal.smart.achievable}</p>,
          )}

        {facts.length > 0 &&
          section(
            t('facts'),
            <dl className="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2">
              {facts.map(({ key, label, value, Icon, dots }) => (
                <div key={key} className="grid min-w-0 gap-0.5">
                  <dt className="flex items-center gap-1.5 text-xs text-ink-3">
                    <Icon aria-hidden="true" className="size-4 stroke-[1.75]" />
                    {label}
                  </dt>
                  <dd className="flex items-center gap-2 text-[0.9375rem] font-semibold">
                    {dots !== undefined && (
                      <span aria-hidden="true" className="inline-flex gap-0.75">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span
                            key={i}
                            className={
                              i <= dots
                                ? 'size-1.75 rounded-full bg-accent'
                                : 'size-1.75 rounded-full bg-line-strong'
                            }
                          />
                        ))}
                      </span>
                    )}
                    {value}
                  </dd>
                </div>
              ))}
            </dl>,
          )}

        {goal.firstStep && (
          <div className="grid gap-1 rounded-card bg-accent-soft px-4.5 py-4">
            <p className="label-caps text-accent-strong">{t('firstStep')}</p>
            <p className="font-display text-lg text-ink">{goal.firstStep}</p>
          </div>
        )}

        {goal.notes &&
          section(
            t('notes'),
            <p className="max-w-[65ch] text-md whitespace-pre-line">{goal.notes}</p>,
          )}

        {toComplete.length > 0 && (
          <div className="grid gap-2.5 rounded-card border-[1.5px] border-dashed border-line-strong p-4">
            <p className="label-caps">{t('toComplete')}</p>
            <div className="flex flex-wrap gap-2">
              {toComplete.map((s) => (
                <Link
                  key={s}
                  href={`/goals/${goal.id}/edit/${s}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-dashed border-line-strong bg-card px-4 text-[0.9375rem] text-ink-2 hover:border-ink-3"
                >
                  {`+ ${tFlow(`sections.${s}`)}`}
                </Link>
              ))}
            </div>
          </div>
        )}

        <p className="text-sm text-ink-3">
          {t('keptOn', { date: new Date(goal.createdAt) })}
          {' · '}
          <Link
            href={`/goals/${goal.id}/history`}
            className="text-accent-strong underline-offset-2 hover:underline"
          >
            {t('history')}
          </Link>
        </p>
      </article>

      <div
        className={cn(
          'flex gap-2',
          embedded
            ? 'px-6 pb-10 md:px-10'
            : 'fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20 border-t border-line bg-card px-4 py-2.5 md:static md:mx-auto md:max-w-3xl md:border-0 md:bg-transparent md:px-10 md:pb-12',
        )}
      >
        <Link href={completeHref} className={buttonVariants({ className: 'flex-1 md:flex-none' })}>
          {goal.completenessLevel === 'well_filled' ? t('edit') : t('complete')}
        </Link>
      </div>
    </>
  )
}
