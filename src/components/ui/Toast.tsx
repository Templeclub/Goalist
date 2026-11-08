'use client'

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/cn'
import { Button } from './Button'

export type ToastAction = { label: string; onClick: () => void; primary?: boolean }
export type ToastInput = {
  message: string
  detail?: string
  actions?: ToastAction[]
  durationMs?: number
}
type ToastItem = ToastInput & { id: number }

const ToastContext = createContext<{
  show: (toast: ToastInput) => void
  dismiss: () => void
} | null>(null)

/** Bottom toast, above the mobile navigation. Polite live region; never used for blocking errors. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null)
  const counter = useRef(0)

  const dismiss = useCallback(() => setToast(null), [])
  const show = useCallback((input: ToastInput) => {
    counter.current += 1
    setToast({ ...input, id: counter.current })
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(dismiss, toast.durationMs ?? (toast.actions?.length ? 10000 : 6000))
    return () => clearTimeout(timer)
  }, [toast, dismiss])

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss])

  return (
    <ToastContext value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'pointer-events-none fixed inset-x-3 z-50 flex justify-center',
          'bottom-[calc(env(safe-area-inset-bottom,0px)+5.75rem)] md:inset-x-auto md:right-6 md:bottom-6',
        )}
      >
        {toast && (
          <div
            key={toast.id}
            className="pointer-events-auto grid w-full max-w-md animate-rise gap-3 rounded-2xl bg-ink p-4 text-paper shadow-sheet"
          >
            <p className="text-[0.9375rem]">{toast.message}</p>
            {toast.detail && <p className="text-[0.9375rem] font-semibold">{toast.detail}</p>}
            {toast.actions && toast.actions.length > 0 && (
              <div className="flex justify-end gap-2">
                {toast.actions.map((action) => (
                  <Button
                    key={action.label}
                    size="sm"
                    variant="ghost"
                    className={cn(
                      action.primary
                        ? 'bg-paper text-ink hover:bg-paper hover:text-ink hover:brightness-95'
                        : 'text-paper/85 hover:bg-transparent hover:text-paper',
                    )}
                    onClick={() => {
                      const id = toast.id
                      // An action may show a follow-up toast: only close this one.
                      setToast((current) => (current?.id === id ? null : current))
                      action.onClick()
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ToastContext>
  )
}

export function useToast() {
  const context = use(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}
