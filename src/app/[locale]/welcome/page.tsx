import { Welcome } from '@/components/onboarding/Welcome'
import { initLocale } from '@/i18n/page-locale'

export default async function WelcomePage({ params }: PageProps<'/[locale]/welcome'>) {
  await initLocale(params)
  return (
    <main className="paper-dots">
      <Welcome />
    </main>
  )
}
