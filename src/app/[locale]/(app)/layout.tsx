import { AppShell } from '@/components/layout/AppShell'
import { APP_NAME } from '@/config/app'

export default function AppLayout({ children }: LayoutProps<'/[locale]'>) {
  return <AppShell appName={APP_NAME}>{children}</AppShell>
}
