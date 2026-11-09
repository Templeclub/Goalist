import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { SignInPanel } from '@/components/auth/SignInPanel'
import { Link } from '@/i18n/navigation'
import { isCallbackError } from '@/features/auth/callback-error'
import { initLocale } from '@/i18n/page-locale'

export async function generateMetadata({ params }: PageProps<'/[locale]/sign-in'>) {
  const locale = await initLocale(params)
  const t = await getTranslations({ locale, namespace: 'auth' })
  return { title: t('title') }
}

export default async function SignInPage({ params, searchParams }: PageProps<'/[locale]/sign-in'>) {
  await initLocale(params)
  const tNav = await getTranslations('common.nav')
  return (
    <main className="paper-dots min-h-dvh px-[max(1.25rem,env(safe-area-inset-left))] py-8 md:py-16">
      <div className="mx-auto grid max-w-md gap-6">
        <Link href="/home" className="text-[0.9375rem] font-semibold text-accent-strong">
          {tNav('home')}
        </Link>
        <div className="rounded-card border border-card-border bg-card p-6 shadow-card md:p-8">
          <Suspense>
            <Panel searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </main>
  )
}

async function Panel({
  searchParams,
}: {
  searchParams: PageProps<'/[locale]/sign-in'>['searchParams']
}) {
  const { error } = await searchParams
  return <SignInPanel initialError={isCallbackError(error) ? error : null} />
}
