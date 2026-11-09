import createIntlMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from '@/i18n/routing'
import { authLandingRedirect } from '@/lib/auth-landing'
import { refreshSession } from '@/lib/supabase/proxy'

const intl = createIntlMiddleware(routing)

/**
 * 1. next-intl resolves the locale (cookie → Accept-Language → default) and
 *    rewrites to /[locale] without changing the URL.
 * 2. The Supabase session is refreshed on the same response.
 * Before both: a sign-in code that landed on a page is sent on to /api/auth/callback.
 */
export default async function proxy(request: NextRequest) {
  // A sign-in code that landed on a page (Supabase fell back to the Site URL) goes on to the callback.
  const landing = authLandingRedirect(request.nextUrl)
  if (landing) return NextResponse.redirect(landing)
  const response = intl(request)
  return refreshSession(request, response)
}

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
