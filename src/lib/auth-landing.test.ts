import { describe, expect, it } from 'vitest'
import { authLandingRedirect } from './auth-landing'

describe('authLandingRedirect', () => {
  it('sends a code that landed on the Site URL to the callback', () => {
    const target = authLandingRedirect(new URL('https://boosteur.app/?code=abc123'))
    expect(target?.pathname).toBe('/api/auth/callback')
    expect(target?.searchParams.get('code')).toBe('abc123')
    expect(target?.searchParams.get('next')).toBe('/home')
  })

  it('forwards an error so the sign-in page can explain it', () => {
    const target = authLandingRedirect(
      new URL('https://boosteur.app/?error=server_error&error_code=identity_already_exists'),
    )
    expect(target?.searchParams.get('error_code')).toBe('identity_already_exists')
    expect(target?.searchParams.has('code')).toBe(false)
  })

  it('leaves ordinary pages and the callback itself alone', () => {
    expect(authLandingRedirect(new URL('https://boosteur.app/home?q=pain'))).toBeNull()
    expect(authLandingRedirect(new URL('https://boosteur.app/api/auth/callback?code=x'))).toBeNull()
  })
})
