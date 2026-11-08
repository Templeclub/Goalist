import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

/** Quiet reminder that an anonymous notebook only lives on this device (D-030). */
export async function AnonymousBanner() {
  const t = await getTranslations('app.anonymousBanner')
  return (
    <p className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-md bg-paper-2 px-4 py-2.5 text-[0.9375rem] text-ink-2">
      {t('text')}
      <Link
        href="/sign-in"
        className="font-semibold text-accent-strong underline-offset-2 hover:underline"
      >
        {t('action')}
      </Link>
    </p>
  )
}
