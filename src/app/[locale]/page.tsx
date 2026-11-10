import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { use } from 'react'
import { BrandMark } from '@/components/brand/BrandMark'
import { GoalCard } from '@/components/goal/GoalCard'
import { buttonVariants } from '@/components/ui/Button'
import { Link } from '@/i18n/navigation'
import { NotebookIllustration } from '@/components/ui/NotebookIllustration'
import { APP_NAME } from '@/config/app'
import { routing } from '@/i18n/routing'

/** Public landing (phase 0 skeleton). Phase 1 adds sign-in and the express capture. */
export default function LandingPage({ params }: PageProps<'/[locale]'>) {
  const { locale } = use(params)
  setRequestLocale(hasLocale(routing.locales, locale) ? locale : routing.defaultLocale)
  const t = useTranslations('landing')

  return (
    <main className="paper-dots min-h-dvh px-[max(1.25rem,env(safe-area-inset-left))] py-12 md:py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-[1.2fr_1fr]">
        <div className="grid gap-5">
          <p className="flex items-center gap-2.5">
            <BrandMark size={44} />
            <span className="font-display text-2xl font-extrabold">{APP_NAME}</span>
          </p>
          <p className="label-caps">{t('eyebrow')}</p>
          <h1 className="font-display text-3xl font-bold tracking-[-0.015em] md:text-[3.25rem] md:leading-[1.02]">
            {t('title')}
          </h1>
          <p className="max-w-[58ch] text-md text-ink-2">{t('lead', { appName: APP_NAME })}</p>
          <p className="font-display text-lg text-accent-strong italic">{t('soon')}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/welcome" className={buttonVariants()}>
              {t('start')}
            </Link>
            <Link href="/sign-in" className={buttonVariants({ variant: 'secondary' })}>
              {t('signIn')}
            </Link>
          </div>
        </div>
        <div className="grid gap-6">
          <NotebookIllustration className="mx-auto" />
          <GoalCard
            title={t('sampleTitle')}
            emoji="🌌"
            categories={['travel']}
            status="confirmed"
            horizon="medium"
            headingLevel="h2"
          />
        </div>
      </div>
      <section className="mx-auto mt-16 max-w-5xl border-t border-line pt-8">
        <h2 className="label-caps">{t('principlesTitle', { appName: APP_NAME })}</h2>
        <ul className="mt-4 grid gap-3 text-md text-ink-2 md:grid-cols-3">
          <li>{t('principles.pressure')}</li>
          <li>{t('principles.compare')}</li>
          <li>{t('principles.generate')}</li>
        </ul>
        <p className="mt-10 text-sm text-ink-3">{t('footer', { appName: APP_NAME })}</p>
      </section>
    </main>
  )
}
