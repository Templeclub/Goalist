'use client'

import { useRouter } from '@/i18n/navigation'
import { OnboardingFlow } from './OnboardingFlow'

/** Route wrapper: remembers completion server-side when a session exists. */
export function Welcome() {
  const router = useRouter()
  return (
    <OnboardingFlow
      onDone={() => {
        void fetch('/api/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ onboardingCompleted: true }),
        }).catch(() => {})
        router.push('/home')
      }}
    />
  )
}
