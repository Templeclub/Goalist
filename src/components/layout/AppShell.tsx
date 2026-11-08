'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState, type ReactNode } from 'react'
import { CaptureProvider, useCapture } from '../capture/CaptureProvider'
import { ToastProvider } from '../ui/Toast'
import { BottomNav } from './BottomNav'
import { SideNav } from './SideNav'

const COLLAPSED_KEY = 'elan:sidenav-collapsed'

function Shell({ appName, children }: { appName: string; children: ReactNode }) {
  const t = useTranslations('app')
  const { open } = useCapture()
  const [collapsed, setCollapsed] = useState(false)

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
        className="sticky top-0 hidden h-dvh shrink-0 md:flex"
      />
      <main id="main" className="min-w-0 flex-1 pb-28 md:pb-16">
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
