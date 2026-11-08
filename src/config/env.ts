import { z } from 'zod'

/*
 * Public environment (inlined in the client bundle). Parsed lazily so that pages
 * which do not touch Supabase (landing, Storybook) build without it.
 * Variables must be read with their literal names for Next.js to inline them.
 */
const PublicEnv = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
  NEXT_PUBLIC_SITE_URL: z.url().default('http://localhost:3000'),
})

export type PublicEnv = z.infer<typeof PublicEnv>

let cached: PublicEnv | null = null

export function publicEnv(): PublicEnv {
  cached ??= PublicEnv.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  })
  return cached
}

/** True when Supabase is configured (lets the proxy skip auth work otherwise). */
export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  )
}
