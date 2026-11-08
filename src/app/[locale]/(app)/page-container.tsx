import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Reading width for app screens: one column, generous air. */
export function PageContainer({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'mx-auto grid w-full max-w-3xl gap-8 px-[max(1.25rem,env(safe-area-inset-left))] pt-[max(1.5rem,env(safe-area-inset-top))] md:px-8 md:pt-10',
        className,
      )}
    >
      {children}
    </div>
  )
}
