'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useId, useState, type FormEvent } from 'react'
import { z } from 'zod'
import { Link } from '@/i18n/navigation'
import { Button } from '../ui/Button'
import { inputClass } from '../ui/Field'
import { IconButton } from '../ui/IconButton'

export type AuthErrorKey =
  | 'email'
  | 'passwordShort'
  | 'credentials'
  | 'emailTaken'
  | 'rateLimit'
  | 'network'
  | 'captcha'
  | 'unknown'
  | 'callback'
  | 'googleTaken'
  | 'googleLinkOff'

export type SignInFormProps = {
  /** An anonymous notebook already exists on this device: we convert it. */
  converting: boolean
  onMagicLink: (email: string) => Promise<void>
  onGoogle: () => Promise<void>
  onPassword: (
    mode: 'sign-in' | 'sign-up',
    email: string,
    password: string,
  ) => Promise<'done' | 'check-email'>
  initialError?: AuthErrorKey | null
}

const Email = z.email()

/** One page to sign in or create an account (docs/screens/07-auth.md). */
export function SignInForm({
  converting,
  onMagicLink,
  onGoogle,
  onPassword,
  initialError = null,
}: SignInFormProps) {
  const t = useTranslations('auth')
  const id = useId()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [withPassword, setWithPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<AuthErrorKey | null>(initialError)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const run = async (action: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    try {
      await action()
    } catch (e) {
      setError((e instanceof Error && (e.message as AuthErrorKey)) || 'unknown')
    } finally {
      setBusy(false)
    }
  }

  const sendLink = (event?: FormEvent) => {
    event?.preventDefault()
    if (!Email.safeParse(email.trim()).success) return setError('email')
    void run(async () => {
      await onMagicLink(email.trim())
      setSentTo(email.trim())
      setCooldown(60)
    })
  }

  const submitPassword = (mode: 'sign-in' | 'sign-up') => {
    if (!Email.safeParse(email.trim()).success) return setError('email')
    if (password.length < 10) return setError('passwordShort')
    void run(async () => {
      const result = await onPassword(mode, email.trim(), password)
      if (result === 'check-email') setNotice(t('signUpSent'))
    })
  }

  const consent = (
    <p className="text-sm text-ink-3">
      {t.rich('consent', {
        link: (chunks) => (
          <Link href="/privacy" className="underline underline-offset-2">
            {chunks}
          </Link>
        ),
      })}
    </p>
  )

  if (sentTo) {
    return (
      <div className="grid gap-4" aria-live="polite">
        <h2 className="font-display text-xl">{t('sent.title')}</h2>
        <p className="text-md text-ink-2">{t('sent.body', { email: sentTo })}</p>
        {notice && <p className="text-[0.9375rem] text-ink-2">{notice}</p>}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={cooldown > 0 || busy}
            onClick={() =>
              void run(async () => {
                await onMagicLink(sentTo)
                setCooldown(60)
                setNotice(t('sent.resent'))
              })
            }
          >
            {cooldown > 0 ? t('sent.resendIn', { seconds: cooldown }) : t('sent.resend')}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSentTo(null)}>
            {t('sent.change')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-5">
      <form className="grid gap-3" onSubmit={sendLink} noValidate>
        <label htmlFor={`${id}-email`} className="font-bold">
          {t('email')}
        </label>
        <input
          id={`${id}-email`}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          aria-invalid={error === 'email' || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={inputClass}
        />
        {withPassword && (
          <>
            <label htmlFor={`${id}-password`} className="font-bold">
              {t('password')}
            </label>
            <div className="relative">
              <input
                id={`${id}-password`}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby={`${id}-password-hint`}
                className={`${inputClass} pr-14`}
              />
              <IconButton
                label={showPassword ? t('hidePassword') : t('showPassword')}
                icon={showPassword ? <EyeOff /> : <Eye />}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-1 -translate-y-1/2"
              />
            </div>
            <p id={`${id}-password-hint`} className="text-sm text-ink-3">
              {t('passwordHint')}
            </p>
          </>
        )}
        {error && (
          <p
            id={`${id}-error`}
            role="alert"
            className="rounded-md bg-accent-soft px-3 py-2.5 text-[0.9375rem] text-accent-strong"
          >
            {t(`errors.${error}`)}
          </p>
        )}
        {notice && <p className="text-[0.9375rem] text-ink-2">{notice}</p>}
        {withPassword ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <Button disabled={busy} onClick={() => submitPassword('sign-in')}>
              {t('signIn')}
            </Button>
            <Button variant="secondary" disabled={busy} onClick={() => submitPassword('sign-up')}>
              {t('signUp')}
            </Button>
          </div>
        ) : (
          <Button type="submit" block disabled={busy}>
            {t('sendLink')}
          </Button>
        )}
      </form>

      {!converting && (
        <div className="flex items-center justify-center">
          <Button variant="ghost" size="sm" onClick={() => setWithPassword(!withPassword)}>
            {withPassword ? t('useLink') : t('usePassword')}
          </Button>
        </div>
      )}

      <div aria-hidden="true" className="flex items-center gap-3 text-sm text-ink-3">
        <span className="h-px flex-1 bg-line" />
        {t('or')}
        <span className="h-px flex-1 bg-line" />
      </div>
      <Button variant="secondary" block disabled={busy} onClick={() => void run(onGoogle)}>
        {t('google')}
      </Button>
      {consent}
    </div>
  )
}
