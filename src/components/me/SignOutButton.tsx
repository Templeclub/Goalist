'use client'

import { useTranslations } from 'next-intl'
import { Button } from '../ui/Button'

/** Signs out and forgets the pages the service worker kept on this device. */
export function SignOutButton() {
  const t = useTranslations('me')
  return (
    <form
      action="/api/auth/sign-out"
      method="post"
      onSubmit={() => {
        navigator.serviceWorker?.controller?.postMessage('clear')
        try {
          localStorage.clear()
        } catch {}
      }}
    >
      <Button type="submit" variant="secondary">
        {t('signOut')}
      </Button>
    </form>
  )
}
