import { cn } from '@/lib/cn'

/** Loading placeholder; shapes mirror the real content. Never a full-screen spinner. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('block animate-shimmer rounded-sm bg-paper-2', className)}
    />
  )
}
