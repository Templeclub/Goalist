import { getFormatter, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { initLocale } from '@/i18n/page-locale'

const sections = ['what', 'why', 'who', 'age', 'rights'] as const
const DRAFT_DATE = new Date('2026-11-08T12:00:00Z')

export async function generateMetadata({ params }: PageProps<'/[locale]/privacy'>) {
  const locale = await initLocale(params)
  const t = await getTranslations({ locale, namespace: 'privacy' })
  return { title: t('title') }
}

export default async function PrivacyPage({ params }: PageProps<'/[locale]/privacy'>) {
  await initLocale(params)
  const [t, tNav, format] = await Promise.all([
    getTranslations('privacy'),
    getTranslations('common.nav'),
    getFormatter(),
  ])
  return (
    <main className="px-[max(1.25rem,env(safe-area-inset-left))] py-10 md:py-16">
      <article className="mx-auto grid max-w-[65ch] gap-6">
        <Link href="/home" className="text-[0.9375rem] font-semibold text-accent-strong">
          {tNav('home')}
        </Link>
        <h1 className="font-display text-3xl font-medium">{t('title')}</h1>
        <p className="text-sm text-ink-3">
          {t('draft', { date: format.dateTime(DRAFT_DATE, 'short') })}
        </p>
        {sections.map((key) => (
          <section key={key} className="grid gap-2">
            <h2 className="font-display text-lg font-medium">{t(`sections.${key}.title`)}</h2>
            <p className="text-md text-ink-2">{t(`sections.${key}.body`)}</p>
          </section>
        ))}
      </article>
    </main>
  )
}
