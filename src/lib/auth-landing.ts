/**
 * When Supabase does not accept the requested return address (it is missing from
 * Authentication → URL Configuration → Redirect URLs), it sends the person back to the
 * Site URL with `?code=` or `?error_code=` instead of /api/auth/callback. Nothing would
 * exchange that code: this sends it on to the callback, which signs in or explains the error.
 */
export function authLandingRedirect(url: URL): URL | null {
  if (url.pathname.startsWith('/api/')) return null
  const code = url.searchParams.get('code')
  const errorCode = url.searchParams.get('error_code')
  if (!code && !errorCode) return null
  const target = new URL('/api/auth/callback', url.origin)
  if (code) target.searchParams.set('code', code)
  if (errorCode) target.searchParams.set('error_code', errorCode)
  target.searchParams.set('next', '/home')
  return target
}
