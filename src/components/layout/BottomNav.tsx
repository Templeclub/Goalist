'use client'

import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { isActive, navItems, type NavItem } from './nav-items'

/** Mobile bottom bar: Accueil · Mes envies · + · Moi. The "+" opens the express capture. */
export function BottomNav({
  onNewGoal,
  className,
}: {
  onNewGoal?: () => void
  className?: string
}) {
  const t = useTranslations('common.nav')
  const pathname = usePathname()
  const [home, goals, me] = navItems as [NavItem, NavItem, NavItem]

  const item = (nav: NavItem) => {
    const active = isActive(pathname, nav.href)
    const Icon = nav.icon
    return (
      <Link
        href={nav.href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'grid min-h-12 content-center justify-items-center gap-0.5 rounded-md text-[0.78125rem]',
          active ? 'font-bold text-accent' : 'text-ink-3 hover:text-ink-2',
        )}
      >
        <Icon aria-hidden="true" className="size-5 stroke-[1.75]" />
        {t(nav.key)}
      </Link>
    )
  }

  return (
    <nav
      aria-label={t('label')}
      className={cn(
        'grid grid-cols-4 items-center border-t border-line bg-card px-2 pt-1.5',
        'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
        className,
      )}
    >
      {item(home)}
      {item(goals)}
      <button
        type="button"
        onClick={onNewGoal}
        aria-label={t('new')}
        aria-keyshortcuts="N"
        className="mx-auto grid size-13 cursor-pointer place-items-center rounded-full bg-accent text-ink-on-accent shadow-card transition-[filter] hover:brightness-95"
      >
        <Plus aria-hidden="true" className="size-6 stroke-2" />
      </button>
      {item(me)}
    </nav>
  )
}
