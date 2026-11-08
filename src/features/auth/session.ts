import 'server-only'
import { hasSupabaseEnv } from '@/config/env'
import { createClient } from '@/lib/supabase/server'

export type Viewer = { id: string; isAnonymous: boolean; email: string | null }

/**
 * The current person, from the validated JWT (never trusted from the client).
 * Reads cookies: call it inside a <Suspense> boundary (Cache Components).
 */
export async function getViewer(): Promise<Viewer | null> {
  if (!hasSupabaseEnv()) return null
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  if (!claims?.sub) return null
  return {
    id: claims.sub,
    isAnonymous: claims.is_anonymous === true,
    email: typeof claims.email === 'string' && claims.email ? claims.email : null,
  }
}
