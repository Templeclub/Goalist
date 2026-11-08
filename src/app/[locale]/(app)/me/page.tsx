import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { PseudoField } from '@/components/me/PseudoField'
import { Button, buttonVariants } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { getViewer } from '@/features/auth/session'
import { getProfile } from '@/features/goals/queries'
import { Link } from '@/i18n/navigation'
import { initLocale } from '@/i18n/page-locale'
import { PageContainer } from '../page-container'

export async function generateMetadata({ params }: PageProps<'/[locale]/me'>) {
  const locale = await initLocale(params)
  const t = await getTranslations({ locale, namespace: 'me' })
  return { title: t('title') }
}

export default async function MePage({ params }: PageProps<'/[locale]/me'>) {
  await initLocale(params)
  const t = await getTranslations('me')
  return (
    <PageContainer>
      <h1 className="font-display text-2xl font-medium">{t('title')}</h1>
      <Suspense fallback={<Skeleton className="h-40 w-full rounded-card" />}>
        <MeContent />
      </Suspense>
      <Link href="/privacy" className="text-[0.9375rem] text-ink-2 underline underline-offset-2">
        {t('privacy')}
      </Link>
    </PageContainer>
  )
}

async function MeContent() {
  const [t, viewer] = await Promise.all([getTranslations('me'), getViewer()])
  const profile = viewer ? await getProfile() : null

  return (
    <>
      <section
        aria-labelledby="notebook-title"
        className="grid gap-3 rounded-card border border-card-border bg-card p-5 shadow-card"
      >
        <h2 id="notebook-title" className="label-caps">
          {t('notebook.title')}
        </h2>
        {!viewer && (
          <>
            <p className="text-md">{t('notebook.none')}</p>
            <Link
              href="/sign-in"
              className={buttonVariants({
                variant: 'secondary',
                size: 'sm',
                className: 'justify-self-start',
              })}
            >
              {t('notebook.haveOne')}
            </Link>
          </>
        )}
        {viewer?.isAnonymous && (
          <>
            <p className="text-md">{t('notebook.anonymous')}</p>
            <p className="text-sm text-ink-3">{t('notebook.anonymousNote')}</p>
            <Link
              href="/sign-in"
              className={buttonVariants({ size: 'sm', className: 'justify-self-start' })}
            >
              {t('notebook.keep')}
            </Link>
          </>
        )}
        {viewer && !viewer.isAnonymous && (
          <p className="text-md">{t('notebook.account', { email: viewer.email ?? '' })}</p>
        )}
      </section>

      {viewer && <PseudoField initial={profile?.display_name ?? null} />}

      {viewer && !viewer.isAnonymous && (
        <form action="/api/auth/sign-out" method="post">
          <Button type="submit" variant="secondary">
            {t('signOut')}
          </Button>
        </form>
      )}
    </>
  )
}
