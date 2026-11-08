import { getTranslations } from 'next-intl/server'
import { NotebookIllustration } from '@/components/ui/NotebookIllustration'
import { initLocale } from '@/i18n/page-locale'

/** Shown by the service worker when a page was never visited and the network is gone. */
export default async function OfflinePage({ params }: PageProps<'/[locale]/offline'>) {
  await initLocale(params)
  const t = await getTranslations('app.offlinePage')
  return (
    <main className="paper-dots grid min-h-dvh place-items-center px-6 text-center">
      <div className="grid max-w-sm justify-items-center gap-4">
        <NotebookIllustration />
        <h1 className="font-display text-2xl font-medium">{t('title')}</h1>
        <p className="text-md text-ink-2">{t('body')}</p>
      </div>
    </main>
  )
}
