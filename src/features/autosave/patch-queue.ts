import type { SaveState } from '@/components/ui/SaveIndicator'
import { uuidv7 } from '@/lib/uuid'

export class HttpError extends Error {
  constructor(public readonly status: number) {
    super(`HTTP ${status}`)
  }
}

export type SendOptions = { keepalive?: boolean }
export type Sender<P> = (
  patch: P,
  baseVersion: number,
  clientMutationId: string,
  options: SendOptions,
) => Promise<{ version: number }>

type Options<P> = {
  send: Sender<P>
  version: number
  onState?: (state: SaveState) => void
  onVersion?: (version: number) => void
  /** Called when the server refuses a patch for good (validation). */
  onRejected?: (patch: P) => void
  /** Persist unsent changes so a reload or a crash never loses them. */
  storageKey?: string
  debounceMs?: number
  /** "Saving…" only shows after this delay, to avoid flicker (D-005). */
  showSavingAfterMs?: number
}

type Stored<P> = { patch: P; baseVersion: number }

function readStore<P>(key: string | undefined): Stored<P> | null {
  if (!key) return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as Stored<P>) : null
  } catch {
    return null
  }
}

function writeStore<P>(key: string | undefined, value: Stored<P> | null) {
  if (!key) return
  try {
    if (value) localStorage.setItem(key, JSON.stringify(value))
    else localStorage.removeItem(key)
  } catch {
    // Storage unavailable (private mode): the in-memory queue still works.
  }
}

/**
 * Field-level autosave queue (docs/plan.md §2.2): merges changes, debounces,
 * sends one patch at a time, retries with backoff and survives reloads.
 */
export class PatchQueue<P extends Record<string, unknown>> {
  private pending: Partial<P> = {}
  private version: number
  private debounceTimer: ReturnType<typeof setTimeout> | null = null
  private savingTimer: ReturnType<typeof setTimeout> | null = null
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private retryDelay = 2000
  private inFlight: Promise<void> | null = null
  private state: SaveState = 'saved'
  private disposed = false
  private readonly opts: Required<Pick<Options<P>, 'debounceMs' | 'showSavingAfterMs'>> & Options<P>

  constructor(options: Options<P>) {
    this.opts = { debounceMs: 700, showSavingAfterMs: 400, ...options }
    this.version = options.version
    const stored = readStore<P>(options.storageKey)
    if (stored) {
      this.pending = stored.patch
      this.schedule(0)
    }
    if (typeof window !== 'undefined') window.addEventListener('online', this.handleOnline)
  }

  get hasPending() {
    return Object.keys(this.pending).length > 0 || this.inFlight !== null
  }

  set<K extends keyof P>(field: K, value: P[K]) {
    this.pending = { ...this.pending, [field]: value }
    this.persist()
    this.markDirty()
    this.schedule(this.opts.debounceMs)
  }

  /** Send now (section exit, navigation). */
  async flush(options: SendOptions = {}) {
    this.clearTimer('debounceTimer')
    if (this.inFlight) await this.inFlight
    if (Object.keys(this.pending).length === 0) return
    await this.sendPending(options)
  }

  dispose() {
    this.disposed = true
    this.clearTimer('debounceTimer')
    this.clearTimer('savingTimer')
    this.clearTimer('retryTimer')
    if (typeof window !== 'undefined') window.removeEventListener('online', this.handleOnline)
  }

  private handleOnline = () => {
    if (Object.keys(this.pending).length > 0) this.schedule(0)
  }

  private schedule(delay: number) {
    this.clearTimer('debounceTimer')
    this.debounceTimer = setTimeout(() => void this.flush(), delay)
  }

  private markDirty() {
    if (this.state === 'offline' || this.savingTimer) return
    this.savingTimer = setTimeout(() => this.setState('saving'), this.opts.showSavingAfterMs)
  }

  private async sendPending(options: SendOptions) {
    const patch = this.pending as P
    this.pending = {}
    const run = (async () => {
      try {
        const { version } = await this.opts.send(patch, this.version, uuidv7(), options)
        this.version = version
        this.opts.onVersion?.(version)
        this.retryDelay = 2000
        this.clearTimer('retryTimer')
        if (Object.keys(this.pending).length === 0) {
          this.persist()
          this.clearTimer('savingTimer')
          this.setState('saved')
        }
      } catch (error) {
        if (
          error instanceof HttpError &&
          error.status >= 400 &&
          error.status < 500 &&
          ![401, 408, 409, 429].includes(error.status)
        ) {
          // Refused for good: do not loop on it.
          this.opts.onRejected?.(patch)
          this.persist()
          this.clearTimer('savingTimer')
          this.setState('saved')
          return
        }
        // Keep the change (newer edits of the same field win) and retry.
        this.pending = { ...patch, ...this.pending }
        this.persist()
        const offline =
          !(error instanceof HttpError) || (typeof navigator !== 'undefined' && !navigator.onLine)
        this.clearTimer('savingTimer')
        this.setState(offline ? 'offline' : 'saving')
        if (!this.disposed) {
          this.clearTimer('retryTimer')
          this.retryTimer = setTimeout(() => void this.flush(), this.retryDelay)
          this.retryDelay = Math.min(this.retryDelay * 2, 30_000)
        }
      }
    })()
    this.inFlight = run
    await run
    this.inFlight = null
    if (Object.keys(this.pending).length > 0 && !this.retryTimer && !this.disposed) {
      this.schedule(this.opts.debounceMs)
    }
  }

  private persist() {
    const has = Object.keys(this.pending).length > 0
    writeStore(
      this.opts.storageKey,
      has ? { patch: this.pending as P, baseVersion: this.version } : null,
    )
  }

  private setState(state: SaveState) {
    if (this.state === state) return
    this.state = state
    this.opts.onState?.(state)
  }

  private clearTimer(name: 'debounceTimer' | 'savingTimer' | 'retryTimer') {
    const timer = this[name]
    if (timer) clearTimeout(timer)
    this[name] = null
  }
}
