'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useRouter } from '@/i18n/navigation'
import { FOCUS_SEARCH_KEY, SEARCH_INPUT_ID } from '../goals/GoalsToolbar'
import { CaptureProvider, useCapture } from '../capture/CaptureProvider'
import { ToastProvider } from '../ui/Toast'
import { BottomNav } from './BottomNav'
import { SideNav } from './SideNav'

const COLLAPSED_KEY = 'elan:sidenav-collapsed'

function Shell({ appName, children }: { appName: string; children: ReactNode }) {
  const t = useTranslations('app')
  const { open } = useCapture()
  const [collapsed, setCollapsed] = useState(false)
  const [online, setOnline] = useState(true)

  useEffect(() => {
    // Minimal offline support (D-056): production only, so development never serves stale pages.
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
    const update = () => setOnline(navigator.onLine)
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])
  const router = useRouter()

  const openSearch = useCallback(() => {
    const input = document.getElementById(SEARCH_INPUT_ID)
    if (input) return input.focus()
    try {
      sessionStorage.setItem(FOCUS_SEARCH_KEY, '1')
    } catch {}
    router.push('/goals')
  }, [router])

  // "/" opens the search from anywhere (docs/design-system.md §11).
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing =
        target &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      if (event.key !== '/' || typing || event.metaKey || event.ctrlKey || event.altKey) return
      event.preventDefault()
      openSearch()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openSearch])

  useEffect(() => {
    try {
      // Restore a per-device preference after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(localStorage.getItem(COLLAPSED_KEY) === '1')
    } catch {}
  }, [])

  const onCollapsedChange = (next: boolean) => {
    setCollapsed(next)
    try {
      localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0')
    } catch {}
  }

  return (
    <div className="min-h-dvh md:flex">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-card px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t('skipToContent')}
      </a>
      <SideNav
        appName={appName}
        collapsed={collapsed}
        onCollapsedChange={onCollapsedChange}
        onNewGoal={() => open()}
        onSearch={openSearch}
        className="sticky top-0 hidden h-dvh shrink-0 md:flex"
      />
      <main id="main" className="min-w-0 flex-1 pb-28 md:pb-16">
        {!online && (
          <p
            role="status"
            className="sticky top-0 z-30 bg-paper-2 px-5 py-2 text-center text-[0.9375rem] text-ink-2"
          >
            {t('offline')}
          </p>
        )}
        {children}
      </main>
      <BottomNav onNewGoal={() => open()} className="fixed inset-x-0 bottom-0 z-30 md:hidden" />
    </div>
  )
}

/** Authenticated-area chrome: navigation, express capture, toasts. */
export function AppShell({ appName, children }: { appName: string; children: ReactNode }) {
  return (
    <ToastProvider>
      <CaptureProvider>
        <Shell appName={appName}>{children}</Shell>
      </CaptureProvider>
    </ToastProvider>
  )
}
