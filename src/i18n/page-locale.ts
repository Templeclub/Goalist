import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { routing, type Locale } from './routing'

/** Resolves the [locale] param and enables static rendering of the page shell. */
export async function initLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params
  const resolved = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale
  setRequestLocale(resolved)
  return resolved
}
