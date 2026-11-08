import { render, type RenderOptions } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import type { ReactElement, ReactNode } from 'react'
import { frMessages } from '@/i18n/messages'

function Providers({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="fr" messages={frMessages} timeZone="Europe/Paris">
      {children}
    </NextIntlClientProvider>
  )
}

/** Render with the French catalogue, as in the app. */
export function renderWithIntl(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: Providers, ...options })
}
