/**
 * Wishes kept while offline (D-056). Each has its client-generated UUIDv7, so a
 * replay is idempotent: POST /api/goals ignores an id it already has.
 */
export type PendingCapture = { id: string; title: string; acceptTerms?: true }

const KEY = 'elan:pending:captures'

export function readPendingCaptures(): PendingCapture[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as PendingCapture[]) : []
  } catch {
    return []
  }
}

function write(list: PendingCapture[]) {
  try {
    if (list.length) localStorage.setItem(KEY, JSON.stringify(list))
    else localStorage.removeItem(KEY)
  } catch {}
}

export function addPendingCapture(capture: PendingCapture) {
  write([...readPendingCaptures().filter((c) => c.id !== capture.id), capture])
}

/** Sends what is waiting, oldest first; keeps whatever still fails. Returns how many were sent. */
export async function replayPendingCaptures(
  send: (capture: PendingCapture) => Promise<unknown>,
): Promise<number> {
  let sent = 0
  for (const capture of readPendingCaptures()) {
    try {
      await send(capture)
      write(readPendingCaptures().filter((c) => c.id !== capture.id))
      sent += 1
    } catch {
      break
    }
  }
  return sent
}
