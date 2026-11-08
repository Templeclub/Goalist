import createIntlMiddleware from 'next-intl/middleware'
import type { NextRequest } from 'next/server'
import { routing } from '@/i18n/routing'
import { refreshSession } from '@/lib/supabase/proxy'

const intl = createIntlMiddleware(routing)

/**
 * 1. next-intl resolves the locale (cookie → Accept-Language → default) and
 *    rewrites to /[locale] without changing the URL.
 * 2. The Supabase session is refreshed on the same response.
 */
export default async function proxy(request: NextRequest) {
  const response = intl(request)
  return refreshSession(request, response)
}

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
