'use client'

import { loadBrowserClient } from '@/lib/supabase/browser'
import { getCaptchaToken } from './turnstile'

/** True when this device already has a session (anonymous or not). Local read, no network. */
export async function hasLocalSession() {
  const { data } = await (await loadBrowserClient()).auth.getSession()
  return Boolean(data.session)
}

/**
 * Makes sure a session exists before the first wish is kept: creates an
 * anonymous one if needed (first wish before sign-up, D-030).
 */
export async function ensureSession() {
  const supabase = await loadBrowserClient()
  const { data } = await supabase.auth.getSession()
  if (data.session) return data.session
  const captchaToken = await getCaptchaToken()
  const { data: created, error } = await supabase.auth.signInAnonymously({
    options: captchaToken ? { captchaToken } : undefined,
  })
  if (error || !created.session) throw error ?? new Error('anonymous_sign_in_failed')
  return created.session
}
