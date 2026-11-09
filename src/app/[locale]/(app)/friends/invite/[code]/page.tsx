import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { AcceptInvite } from '@/components/friends/AcceptInvite'
import { buttonVariants } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { APP_NAME } from '@/config/app'
import { getViewer } from '@/features/auth/session'
import { AcceptInviteBody } from '@/features/friends/schema'
import { Link } from '@/i18n/navigation'
import { initLocale } from '@/i18n/page-locale'
import { createClient } from '@/lib/supabase/server'
import { PageContainer } from '../../../page-container'

/**
 * Opened from a friend's invite link (D-064). The [code] segment is request data under
 * Cache Components: the whole page streams behind one skeleton.
 */
export default function InvitePage({ params }: PageProps<'/[locale]/friends/invite/[code]'>) {
  return (
    <PageContainer>
      <Suspense fallback={<Skeleton className="h-48 w-full rounded-card" />}>
        <Invite params={params} />
      </Suspense>
    </PageContainer>
  )
}

async function Invite({
  params,
}: {
  params: PageProps<'/[locale]/friends/invite/[code]'>['params']
}) {
  const { code } = await params
  await initLocale(params)
  const [t, viewer] = await Promise.all([getTranslations('friends.acceptPage'), getViewer()])
  const valid = AcceptInviteBody.safeParse({ code }).success
  const supabase = await createClient()
  const { data } = valid
    ? await supabase.rpc('invite_preview', { invite_code: code })
    : { data: null }
  const inviter = data?.[0]

  const box = 'grid gap-4 rounded-card border-[3px] border-outline bg-card p-5 shadow-pop'
  const title = <h1 className="font-display text-3xl font-extrabold">{t('title')}</h1>
  if (!inviter)
    return (
      <>
        {title}
        <p className={box}>{t('notFound')}</p>
      </>
    )
  if (viewer && inviter.owner_id === viewer.id)
    return (
      <>
        {title}
        <p className={box}>{t('own')}</p>
      </>
    )

  const from = inviter.display_name
    ? t('from', { name: inviter.display_name, appName: APP_NAME })
    : t('fromUnknown', { appName: APP_NAME })

  return (
    <>
      {title}
      <section className={box}>
        <p className="font-display text-xl font-extrabold">{from}</p>
        <p className="text-md text-ink-2">{t('explain')}</p>
        {viewer && !viewer.isAnonymous ? (
          <AcceptInvite code={code} />
        ) : (
          <>
            <p className="text-[0.9375rem] font-bold">{t('needAccount')}</p>
            <Link
              href={`/sign-in?next=${encodeURIComponent(`/friends/invite/${code}`)}`}
              className={buttonVariants({ block: true })}
            >
              {t('signIn')}
            </Link>
          </>
        )}
      </section>
    </>
  )
}
