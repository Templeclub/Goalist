import { Check, CloudOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/cn'

export type SaveState = 'saved' | 'saving' | 'offline'

/** Discreet autosave status. "saving" should only be shown after ~400 ms (see D-005). */
export function SaveIndicator({ state, className }: { state: SaveState; className?: string }) {
  const t = useTranslations('common.save')
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        'inline-flex items-center gap-1 text-[0.84375rem] whitespace-nowrap text-ink-3',
        className,
      )}
    >
      {state === 'saved' && <Check aria-hidden="true" className="size-4 stroke-2" />}
      {state === 'saving' && (
        <span aria-hidden="true" className="size-1.5 animate-shimmer rounded-full bg-ink-3" />
      )}
      {state === 'offline' && <CloudOff aria-hidden="true" className="size-4 stroke-[1.75]" />}
      {t(state)}
    </span>
  )
}
