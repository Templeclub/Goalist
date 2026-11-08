import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

/**
 * Resolves the locale (cookie → Accept-Language → default) and rewrites to /[locale].
 * Phase 1 adds the Supabase session refresh here.
 */
export default createMiddleware(routing)

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
