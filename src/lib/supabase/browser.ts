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
