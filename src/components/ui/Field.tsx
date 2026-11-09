import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { HelpDrawer } from './HelpDrawer'

type FieldProps = {
  id: string
  label: string
  /** Every field except the title is optional; say so quietly. */
  optional?: boolean
  hint?: string
  help?: { explanation: string; example?: { before: string; after: string } }
  /** Gentle guidance (never an aggressive error). */
  message?: string
  className?: string
  children: ReactNode
}

/**
 * Label + optional help drawer + hint + control. The control must use `id`
 * and `aria-describedby={`${id}-hint`}` when a hint or message is present.
 */
export function Field({
  id,
  label,
  optional,
  hint,
  help,
  message,
  className,
  children,
}: FieldProps) {
  const t = useTranslations('common.field')
  return (
    <div className={cn('grid gap-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="font-bold">
          {label}
          {optional && (
            <span className="ml-1.5 font-normal text-ink-3">
              {'· '}
              {t('optional')}
            </span>
          )}
        </label>
        {help && <HelpDrawer field={label} explanation={help.explanation} example={help.example} />}
      </div>
      {children}
      {(hint || message) && (
        <p
          id={`${id}-hint`}
          className={cn('text-[0.9375rem]', message ? 'text-accent-strong' : 'text-ink-3')}
        >
          {message ?? hint}
        </p>
      )}
    </div>
  )
}

/** Shared look for text inputs and textareas (16 px min to avoid iOS zoom). */
export const inputClass = cn(
  'w-full rounded-md border-2 border-line-strong bg-card px-4 py-3 text-md text-ink',
  'placeholder:text-ink-3',
  'focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent',
)
