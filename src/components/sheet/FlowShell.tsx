'use client'

import { Check, History, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { flowSections, type FlowSection } from '@/features/goals/sections'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { Button } from '../ui/Button'
import { SaveIndicator, type SaveState } from '../ui/SaveIndicator'

export type SectionState = 'done' | 'empty'

type FlowShellProps = {
  goalId: string
  title: string
  section: FlowSection
  sectionStates: Record<FlowSection, SectionState>
  saveState: SaveState
  preview: ReactNode
  onNavigate: (target: FlowSection | 'detail', options?: { snapshot?: boolean }) => void
  onFinish?: () => void
  children: ReactNode
}

/**
 * "Donner vie à cette envie": one section per screen, progress, sticky table of
 * contents and live preview on desktop (docs/screens/03, D-045).
 */
export function FlowShell({
  goalId,
  title,
  section,
  sectionStates,
  saveState,
  preview,
  onNavigate,
  onFinish,
  children,
}: FlowShellProps) {
  const t = useTranslations('flow')
  const index = flowSections.indexOf(section)
  const next = flowSections[index + 1]
  const label = (s: FlowSection) => t(`sections.${s}`)

  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[15rem_minmax(0,1fr)_21rem]">
      {/* Table of contents (desktop) */}
      <nav
        aria-label={t('toc')}
        className="sticky top-0 hidden h-dvh flex-col gap-4 border-r border-line px-4 py-7 lg:flex"
      >
        <p className="label-caps">{t('title')}</p>
        <ol className="grid gap-0.5">
          {flowSections.map((s, i) => {
            const current = s === section
            const done = sectionStates[s] === 'done'
            return (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => onNavigate(s)}
                  aria-current={current ? 'step' : undefined}
                  className={cn(
                    'flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 text-left text-[0.9375rem]',
                    current
                      ? 'border border-card-border bg-card font-bold text-ink shadow-card'
                      : 'text-ink-2 hover:bg-paper-2',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'grid size-5.5 shrink-0 place-items-center rounded-full border-[1.5px] text-xs',
                      done
                        ? 'border-accent bg-accent text-ink-on-accent'
                        : current
                          ? 'border-accent text-accent-strong'
                          : 'border-line-strong text-ink-3',
                    )}
                  >
                    {done ? <Check className="size-3.5 stroke-3" /> : i + 1}
                  </span>
                  {label(s)}
                  <span className="sr-only">{`, ${t(`state.${current ? 'current' : done ? 'done' : 'empty'}`)}`}</span>
                </button>
              </li>
            )
          })}
        </ol>
        <p className="mt-auto text-sm text-ink-3">{t('tocFoot')}</p>
      </nav>

      <div className="flex min-h-dvh min-w-0 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-1 border-b border-line bg-paper px-2 pt-[env(safe-area-inset-top)] lg:px-6">
          <button
            type="button"
            onClick={() => onNavigate('detail')}
            aria-label={t('close')}
            className="grid size-11 cursor-pointer place-items-center rounded-md text-ink-2 hover:bg-paper-2"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
          <span className="min-w-0 flex-1 truncate text-[0.9375rem] text-ink-2">{title}</span>
          <SaveIndicator state={saveState} />
          <Link
            href={`/goals/${goalId}/history`}
            aria-label={t('history')}
            title={t('history')}
            className="grid size-11 place-items-center rounded-md text-ink-2 hover:bg-paper-2"
          >
            <History aria-hidden="true" className="size-5" />
          </Link>
        </header>

        {/* Progress (mobile and tablet) */}
        <div className="px-5 pt-2 lg:hidden">
          <div aria-hidden="true">
            <span
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${flowSections.length}, minmax(0, 1fr))` }}
            >
              {flowSections.map((s) => (
                <span
                  key={s}
                  className={cn(
                    'h-1 rounded-full',
                    s === section
                      ? 'bg-accent shadow-[0_0_0_2px_var(--accent-soft)]'
                      : sectionStates[s] === 'done'
                        ? 'bg-accent'
                        : 'bg-line',
                  )}
                />
              ))}
            </span>
          </div>
          <p className="pt-2 text-sm text-ink-3">
            {t('progress', {
              label: label(section),
              current: index + 1,
              total: flowSections.length,
            })}
          </p>
        </div>

        <main
          id="main"
          className="mx-auto grid w-full max-w-[40rem] flex-1 content-start gap-7 px-5 pt-5 pb-10 lg:px-10 lg:pt-10"
        >
          {children}
        </main>

        {/* Footer */}
        <footer className="sticky bottom-0 z-20 flex justify-between gap-2 border-t border-line bg-paper px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] lg:static lg:mx-auto lg:w-full lg:max-w-[40rem] lg:border-0 lg:px-10">
          {next ? (
            <>
              <Button variant="ghost" onClick={() => onNavigate(next)}>
                {t('skip')}
              </Button>
              <Button
                className="flex-1 lg:flex-none"
                onClick={() => onNavigate(next, { snapshot: true })}
              >
                <span className="lg:hidden">{t('continue')}</span>
                <span className="hidden lg:inline">
                  {t('continueTo', { section: label(next) })}
                </span>
              </Button>
            </>
          ) : (
            <Button block onClick={onFinish}>
              {t('finish')}
            </Button>
          )}
        </footer>
      </div>

      {/* Live preview (desktop) */}
      <aside
        aria-label={t('preview')}
        className="sticky top-0 hidden h-dvh flex-col gap-4 border-l border-line bg-paper-2 px-6 py-7 lg:flex"
      >
        <p className="label-caps">{t('preview')}</p>
        {preview}
      </aside>
    </div>
  )
}
