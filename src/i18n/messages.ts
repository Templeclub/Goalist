import type { Locale } from './routing'

import frCapture from './messages/fr/capture.json'
import frCommon from './messages/fr/common.json'
import frGoal from './messages/fr/goal.json'
import frHome from './messages/fr/home.json'
import frLanding from './messages/fr/landing.json'

/** French is the reference catalogue: its shape defines the message types. */
export const frMessages = {
  common: frCommon,
  goal: frGoal,
  landing: frLanding,
  home: frHome,
  capture: frCapture,
}

export type Messages = typeof frMessages

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
  const [common, goal, landing, home, capture] = await Promise.all([
    import('./messages/en/common.json'),
    import('./messages/en/goal.json'),
    import('./messages/en/landing.json'),
    import('./messages/en/home.json'),
    import('./messages/en/capture.json'),
  ])
  return deepMerge(frMessages, {
    common: common.default,
    goal: goal.default,
    landing: landing.default,
    home: home.default,
    capture: capture.default,
  } as DeepPartial<Messages>)
}
