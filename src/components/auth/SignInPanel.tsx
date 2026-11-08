'use client'

import type { AuthError } from '@supabase/supabase-js'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { getCaptchaToken } from '@/features/auth/turnstile'
import { loadBrowserClient } from '@/lib/supabase/browser'
import { SignInForm, type AuthErrorKey } from './SignInForm'

function mapError(error: AuthError | Error): AuthErrorKey {
  const code = 'code' in error ? error.code : undefined
  if (code === 'invalid_credentials') return 'credentials'
  if (
    code === 'email_exists' ||
    code === 'user_already_exists' ||
    code === 'identity_already_exists'
  )
    return 'emailTaken'
  if (code?.startsWith('over_') || ('status' in error && error.status === 429)) return 'rateLimit'
  if (code === 'weak_password') return 'passwordShort'
  if (code === 'captcha_failed') return 'captcha'
  if (code === 'email_address_invalid' || code === 'validation_failed') return 'email'
  if (error.message?.toLowerCase().includes('fetch')) return 'network'
  return 'unknown'
}

function fail(error: AuthError | Error): never {
  throw new Error(mapError(error))
}

/** Wires the sign-in form to Supabase Auth, converting an anonymous notebook when there is one. */
export function SignInPanel({ initialError }: { initialError?: AuthErrorKey | null }) {
  const t = useTranslations('auth')
  const router = useRouter()
  const [converting, setConverting] = useState(false)

  useEffect(() => {
    void loadBrowserClient()
      .then((client) => client.auth.getClaims())
      .then(({ data }) => setConverting(data?.claims?.is_anonymous === true))
  }, [])

  const callback = (next = '/home') =>
    `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="font-display text-2xl font-medium">
          {converting ? t('titleConvert') : t('title')}
        </h1>
        <p className="text-md text-ink-2">{converting ? t('leadConvert') : t('lead')}</p>
      </div>
      <SignInForm
        converting={converting}
        initialError={initialError}
        onMagicLink={async (email) => {
          const auth = (await loadBrowserClient()).auth
          const { error } = converting
            ? await auth.updateUser({ email }, { emailRedirectTo: callback('/me') })
            : await auth.signInWithOtp({
                email,
                options: { emailRedirectTo: callback(), captchaToken: await getCaptchaToken() },
              })
          if (error) fail(error)
        }}
        onGoogle={async () => {
          const auth = (await loadBrowserClient()).auth
          const { error } = converting
            ? await auth.linkIdentity({
                provider: 'google',
                options: { redirectTo: callback('/me') },
              })
            : await auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: callback() },
              })
          if (error) fail(error)
        }}
        onPassword={async (mode, email, password) => {
          const auth = (await loadBrowserClient()).auth
          if (mode === 'sign-in') {
            const { error } = await auth.signInWithPassword({
              email,
              password,
              options: { captchaToken: await getCaptchaToken() },
            })
            if (error) fail(error)
            router.push('/home')
            router.refresh()
            return 'done'
          }
          const { data, error } = await auth.signUp({
            email,
            password,
            options: { emailRedirectTo: callback(), captchaToken: await getCaptchaToken() },
          })
          if (error) fail(error)
          if (data.session) {
            router.push('/home')
            return 'done'
          }
          return 'check-email'
        }}
      />
    </div>
  )
}
