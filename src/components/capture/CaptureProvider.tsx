'use client'

import { useTranslations } from 'next-intl'
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ensureSession, hasLocalSession } from '@/features/auth/client-session'
import { addPendingCapture, replayPendingCaptures } from '@/features/offline/pending-captures'
import { normaliseTitle } from '@/features/goals/api-schema'
import { createGoal } from '@/features/goals/client-api'
import { useRouter } from '@/i18n/navigation'
import { uuidv7 } from '@/lib/uuid'
import { useToast } from '../ui/Toast'
import { CaptureSheet } from './CaptureSheet'

const DRAFT_KEY = 'elan:capture-draft'

const CaptureContext = createContext<{ open: (prefill?: string) => void } | null>(null)

function readDraft() {
  try {
    return localStorage.getItem(DRAFT_KEY) ?? ''
  } catch {
    return ''
  }
}

function writeDraft(value: string) {
  try {
    if (value) localStorage.setItem(DRAFT_KEY, value)
    else localStorage.removeItem(DRAFT_KEY)
  } catch {
    // Unavailable storage: the draft simply lives in memory.
  }
}

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  )
}

/** Owns the express capture: "+", the home field, the N shortcut and empty-state examples. */
export function CaptureProvider({ children }: { children: ReactNode }) {
  const t = useTranslations('capture.saved')
  const tActions = useTranslations('common.actions')
  const toast = useToast()
  const router = useRouter()
  const [isOpen, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConsent, setShowConsent] = useState(false)

  const open = useCallback((prefill?: string) => {
    setError(null)
    setValue(prefill ?? readDraft())
    setOpen(true)
    void hasLocalSession()
      .then((has) => setShowConsent(!has))
      .catch(() => setShowConsent(true))
  }, [])

  // Replay wishes kept offline, at start and whenever the network returns.
  useEffect(() => {
    const replay = () =>
      void replayPendingCaptures((capture) => createGoal(capture)).then((sent) => {
        if (sent > 0) router.refresh()
      })
    if (navigator.onLine) replay()
    window.addEventListener('online', replay)
    return () => window.removeEventListener('online', replay)
  }, [router])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'n' || event.metaKey || event.ctrlKey || event.altKey) return
      if (isTyping(event.target) || isOpen) return
      event.preventDefault()
      open()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, open])

  const onValueChange = (next: string) => {
    setValue(next)
    writeDraft(next)
  }

  const keep = async () => {
    const title = normaliseTitle(value)
    if (!title || busy) return
    setBusy(true)
    setError(null)
    const consentShown = showConsent
    const id = uuidv7()
    const capture = { id, title, ...(consentShown ? { acceptTerms: true as const } : {}) }
    try {
      if (!navigator.onLine) {
        // Offline: keep it on this device if a notebook already exists here (D-056).
        if (!(await hasLocalSession())) {
          setError(t('needsNetworkFirst'))
          return
        }
        addPendingCapture(capture)
        writeDraft('')
        setValue('')
        setOpen(false)
        toast.show({ message: t('queuedOffline') })
        return
      }
      await ensureSession()
      const result = await createGoal(capture)
      writeDraft('')
      setValue('')
      setOpen(false)
      if (typeof navigator !== 'undefined') navigator.vibrate?.(10)
      router.refresh()
      toast.show({
        message: result.isFirst ? t('first') : t('default'),
        detail: t('offer'),
        actions: [
          { label: tActions('later'), onClick: () => toast.show({ message: t('later') }) },
          { label: tActions('yes'), primary: true, onClick: () => router.push(`/goals/${id}`) },
        ],
      })
    } catch (error) {
      // The network dropped mid-request: same as offline, nothing is lost.
      if (error instanceof TypeError && (await hasLocalSession().catch(() => false))) {
        addPendingCapture(capture)
        writeDraft('')
        setValue('')
        setOpen(false)
        toast.show({ message: t('queuedOffline') })
        return
      }
      setError(t('error'))
    } finally {
      setBusy(false)
    }
  }

  const value_ = useMemo(() => ({ open }), [open])

  return (
    <CaptureContext value={value_}>
      {children}
      <CaptureSheet
        open={isOpen}
        onOpenChange={setOpen}
        value={value}
        onValueChange={onValueChange}
        onKeep={() => void keep()}
        busy={busy}
        showConsent={showConsent}
        error={error}
      />
    </CaptureContext>
  )
}

export function useCapture() {
  const context = use(CaptureContext)
  if (!context) throw new Error('useCapture must be used within a CaptureProvider')
  return context
}
