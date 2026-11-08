'use client'

import type { ComponentProps, ReactNode } from 'react'
import { Drawer } from 'vaul'
import { cn } from '@/lib/cn'

/** Bottom sheet (vaul): drag to close, Esc, focus trapped. Centered dialog from md up. */
export const Sheet = Drawer.Root
export const SheetTrigger = Drawer.Trigger
export const SheetClose = Drawer.Close

type SheetContentProps = ComponentProps<typeof Drawer.Content> & {
  title: string
  /** Hide the title visually when the content has its own heading. */
  hideTitle?: boolean
  description?: string
  /** Full height on mobile (express capture). */
  full?: boolean
  footer?: ReactNode
}

export function SheetContent({
  title,
  hideTitle,
  description,
  full,
  footer,
  className,
  children,
  ...props
}: SheetContentProps) {
  return (
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 z-40 animate-fade bg-scrim" />
      <Drawer.Content
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 flex max-h-[94dvh] flex-col rounded-t-sheet bg-card shadow-sheet outline-none',
          'pb-[env(safe-area-inset-bottom)]',
          'md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:w-[min(560px,calc(100vw-4rem))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-sheet',
          full && 'h-[94dvh] md:h-auto md:max-h-[80dvh]',
          className,
        )}
        {...props}
      >
        <div
          aria-hidden="true"
          className="mx-auto mt-2 h-[5px] w-10 shrink-0 rounded-full bg-line-strong md:hidden"
        />
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-3 pb-4 md:px-7 md:pt-6">
          <Drawer.Title className={cn('font-display text-xl', hideTitle && 'sr-only')}>
            {title}
          </Drawer.Title>
          {description ? (
            <Drawer.Description className="-mt-2 text-ink-2">{description}</Drawer.Description>
          ) : (
            <Drawer.Description className="sr-only">{title}</Drawer.Description>
          )}
          {children}
        </div>
        {footer && <div className="shrink-0 border-t border-line px-5 py-3 md:px-7">{footer}</div>}
      </Drawer.Content>
    </Drawer.Portal>
  )
}
