'use client'

import { useEffect, useRef, useState } from 'react'
import type { SaveState } from '@/components/ui/SaveIndicator'
import { PatchQueue, type Sender } from './patch-queue'

/** React binding for PatchQueue. Flushes with keepalive when the page is hidden. */
export function useAutosave<P extends Record<string, unknown>>({
  send,
  version,
  storageKey,
  onRejected,
}: {
  send: Sender<P>
  version: number
  storageKey?: string
  onRejected?: (patch: P) => void
}) {
  const [state, setState] = useState<SaveState>('saved')
  const queueRef = useRef<PatchQueue<P> | null>(null)
  const sendRef = useRef(send)
  const rejectRef = useRef(onRejected)

  useEffect(() => {
    sendRef.current = send
    rejectRef.current = onRejected
  })

  useEffect(() => {
    const queue = new PatchQueue<P>({
      send: (...args) => sendRef.current(...args),
      onRejected: (patch) => rejectRef.current?.(patch),
      version,
      storageKey,
      onState: setState,
    })
    queueRef.current = queue
    const onHide = () => {
      if (queue.hasPending) void queue.flush({ keepalive: true })
    }
    window.addEventListener('pagehide', onHide)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      window.removeEventListener('pagehide', onHide)
      document.removeEventListener('visibilitychange', onHide)
      if (queue.hasPending) void queue.flush({ keepalive: true })
      queue.dispose()
    }
    // The queue lives as long as the edited record: version is only the starting point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  return {
    state,
    set: <K extends keyof P>(field: K, value: P[K]) => queueRef.current?.set(field, value),
    flush: () => queueRef.current?.flush(),
  }
}
