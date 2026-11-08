import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { safeNext } from '@/lib/http'
import { createClient } from '@/lib/supabase/server'

/**
 * Lands here from the magic link, the e-mail confirmation and Google.
 * Exchanges the code (PKCE) or verifies the token hash, then records the
 * declarations accepted on the sign-in page (15+, privacy policy).
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl
  const next = safeNext(url.searchParams.get('next'))
  const code = url.searchParams.get('code')
  const tokenHash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type') as EmailOtpType | null
  const supabase = await createClient()

  let ok = false
  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error
  } else if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error
  }

  if (!ok) return NextResponse.redirect(new URL('/sign-in?error=callback', url.origin))

  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims?.sub
  if (userId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('age_confirmed_at, privacy_accepted_at')
      .eq('id', userId)
      .maybeSingle()
    const now = new Date().toISOString()
    if (profile && (!profile.age_confirmed_at || !profile.privacy_accepted_at)) {
      await supabase
        .from('profiles')
        .update({
          age_confirmed_at: profile.age_confirmed_at ?? now,
          privacy_accepted_at: profile.privacy_accepted_at ?? now,
        })
        .eq('id', userId)
    }
  }

  return NextResponse.redirect(new URL(next, url.origin))
}
