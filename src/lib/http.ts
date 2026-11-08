import 'server-only'
import { NextResponse } from 'next/server'
import type { z } from 'zod'

const noStore = { 'Cache-Control': 'no-store' }

export function json<T>(body: T, status = 200) {
  return NextResponse.json(body, { status, headers: noStore })
}

export function problem(status: number, code: string) {
  return NextResponse.json({ error: code }, { status, headers: noStore })
}

/** Parses a JSON body with a Zod schema; returns null when it does not match. */
export async function readBody<S extends z.ZodType>(
  request: Request,
  schema: S,
): Promise<z.infer<S> | null> {
  try {
    const parsed = schema.safeParse(await request.json())
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

/** Only same-site relative paths are allowed as redirect targets. */
export function safeNext(next: string | null, fallback = '/home') {
  return next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\')
    ? next
    : fallback
}
