'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from './client'
import type { Database } from './database.types'

let client: SupabaseClient<Database> | null = null

/** One browser client per tab. */
export function getBrowserClient() {
  client ??= createClient()
  return client
}

/** Loads supabase-js only when a session is actually needed (keeps it out of the first load). */
export async function loadBrowserClient() {
  const { createClient: create } = await import('./client')
  client ??= create()
  return client
}
