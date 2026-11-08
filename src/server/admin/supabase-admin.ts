import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { publicEnv } from '@/config/env'
import type { Database } from '@/lib/supabase/database.types'

/*
 * The ONLY place where the secret (service-role) key is used. It bypasses RLS.
 * Allowed uses: account deletion and storage clean-up (docs/plan.md §2.1).
 * ESLint forbids importing this module from anywhere else.
 */
const SecretKey = z.string().min(20)

export function createAdminClient() {
  const secret = SecretKey.parse(process.env.SUPABASE_SECRET_KEY)
  return createClient<Database>(publicEnv().NEXT_PUBLIC_SUPABASE_URL, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
