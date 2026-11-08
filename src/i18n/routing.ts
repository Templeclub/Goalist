import { defineRouting } from 'next-intl/routing'

/**
 * French only at launch; English structure ready (D-011).
 * No locale in URLs: the proxy rewrites to /[locale] internally.
 */
export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'never',
  localeCookie: { name: 'ELAN_LOCALE', maxAge: 60 * 60 * 24 * 365 },
})

export type Locale = (typeof routing.locales)[number]
