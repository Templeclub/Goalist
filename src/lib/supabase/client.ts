'use client'

import { createBrowserClient } from '@supabase/ssr'
import { publicEnv } from '@/config/env'
import type { Database } from './database.types'

/** Browser client: the user's session, so every query goes through RLS. */
export function createClient() {
  const env = publicEnv()
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  )
}
