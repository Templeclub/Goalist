import type { Locale } from './routing'

import frApp from './messages/fr/app.json'
import frAuth from './messages/fr/auth.json'
import frCapture from './messages/fr/capture.json'
import frCommon from './messages/fr/common.json'
import frFlow from './messages/fr/flow.json'
import frGoal from './messages/fr/goal.json'
import frGoals from './messages/fr/goals.json'
import frHome from './messages/fr/home.json'
import frLanding from './messages/fr/landing.json'
import frMe from './messages/fr/me.json'
import frOnboarding from './messages/fr/onboarding.json'
import frPrivacy from './messages/fr/privacy.json'

/** French is the reference catalogue: its shape defines the message types. */
export const frMessages = {
  app: frApp,
  auth: frAuth,
  capture: frCapture,
  common: frCommon,
  flow: frFlow,
  goal: frGoal,
  goals: frGoals,
  home: frHome,
  landing: frLanding,
  me: frMe,
  onboarding: frOnboarding,
  privacy: frPrivacy,
}

export type Messages = typeof frMessages
type Namespace = keyof Messages

const namespaces = Object.keys(frMessages) as Namespace[]

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] }

function deepMerge<T extends object>(base: T, override: DeepPartial<T>): T {
  const out = { ...base } as Record<string, unknown>
  for (const [key, value] of Object.entries(override)) {
    const current = out[key]
    out[key] =
      value && typeof value === 'object' && current && typeof current === 'object'
        ? deepMerge(current as object, value as object)
        : value
  }
  return out as T
}

/** Missing keys in a non-French catalogue fall back to French. */
export async function loadMessages(locale: Locale): Promise<Messages> {
  if (locale === 'fr') return frMessages
  const entries = await Promise.all(
    namespaces.map(
      async (ns) => [ns, (await import(`./messages/${locale}/${ns}.json`)).default] as const,
    ),
  )
  return deepMerge(frMessages, Object.fromEntries(entries) as DeepPartial<Messages>)
}
