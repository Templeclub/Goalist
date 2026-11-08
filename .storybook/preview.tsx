import { withThemeByDataAttribute } from '@storybook/addon-themes'
import type { Preview } from '@storybook/nextjs-vite'
import { NextIntlClientProvider } from 'next-intl'
import { ToastProvider } from '../src/components/ui/Toast'
import { frMessages } from '../src/i18n/messages'
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    nextjs: { appDirectory: true },
    layout: 'padded',
    a11y: { test: 'error' },
    backgrounds: { disable: true },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    viewport: {
      options: {
        mobile: { name: 'Mobile 375', styles: { width: '375px', height: '780px' } },
        tablet: { name: 'Tablette 768', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop 1280', styles: { width: '1280px', height: '800px' } },
      },
    },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: { clair: 'light', sombre: 'dark' },
      defaultTheme: 'clair',
      attributeName: 'data-theme',
      parentSelector: 'html',
    }),
    (Story) => (
      <NextIntlClientProvider locale="fr" messages={frMessages} timeZone="Europe/Paris">
        <ToastProvider>
          <div className="text-ink">
            <Story />
          </div>
        </ToastProvider>
      </NextIntlClientProvider>
    ),
  ],
}

export default preview
