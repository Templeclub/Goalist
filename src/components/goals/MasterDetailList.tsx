'use client'

import type { MouseEvent, ReactNode } from 'react'
import { useRouter } from '@/i18n/navigation'

/**
 * On desktop (≥ 1024 px) a card opens the wish in the right-hand panel
 * (`?open=`) instead of navigating away; on smaller screens links behave normally.
 */
export function MasterDetailList({ search, children }: { search: string; children: ReactNode }) {
  const router = useRouter()

  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.button !== 0
    )
      return
    if (!window.matchMedia('(min-width: 1024px)').matches) return
    const anchor = (event.target as HTMLElement).closest('a[href]')
    const match = anchor?.getAttribute('href')?.match(/\/goals\/([0-9a-f-]{36})$/)
    if (!match) return
    event.preventDefault()
    const params = new URLSearchParams(search)
    params.set('open', match[1]!)
    router.push(`/goals?${params.toString()}`, { scroll: false })
  }

  return <div onClickCapture={onClickCapture}>{children}</div>
}
