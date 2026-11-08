import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Chip } from './Chip'

type EmptyStateProps = {
  title: string
  body: string
  illustration?: ReactNode
  /** Example wishes to tap for inspiration. */
  examples?: { label: string; onSelect?: () => void }[]
  examplesLabel?: (example: string) => string
  className?: string
}

/** Empty states that make you want to write: illustration + sentence + examples. */
export function EmptyState({
  title,
  body,
  illustration,
  examples,
  examplesLabel,
  className,
}: EmptyStateProps) {
  return (
    <section className={cn('grid justify-items-center gap-4 px-2 py-8 text-center', className)}>
      {illustration}
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="max-w-[32ch] text-md text-ink-2">{body}</p>
      {examples && examples.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {examples.map((example) => (
            <Chip
              key={example.label}
              variant="add"
              onClick={example.onSelect}
              aria-label={examplesLabel?.(example.label)}
            >
              {example.label}
            </Chip>
          ))}
        </div>
      )}
    </section>
  )
}
