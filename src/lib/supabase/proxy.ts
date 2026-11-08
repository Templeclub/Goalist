import { createServerClient } from '@supabase/ssr'
import type { NextRequest, NextResponse } from 'next/server'
import { hasSupabaseEnv, publicEnv } from '@/config/env'
import type { Database } from './database.types'

const AUTH_COOKIE = /^sb-.+-auth-token/

/**
 * Refreshes the Supabase session once per navigation and writes the updated
 * cookies on the response. Skipped for visitors without a session cookie, so
 * public pages never wait on the network.
 */
export async function refreshSession(request: NextRequest, response: NextResponse) {
  if (!hasSupabaseEnv()) return response
  if (!request.cookies.getAll().some((c) => AUTH_COOKIE.test(c.name))) return response

  const env = publicEnv()
  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
          for (const [key, value] of Object.entries(headers ?? {})) {
            response.headers.set(key, value)
          }
        },
      },
    },
  )

  // Validates the JWT and refreshes it when needed. Do not run code between
  // client creation and this call.
  await supabase.auth.getClaims()
  return response
}
