'use client'

import { PanelLeft, PanelLeftClose, Plus, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { IconButton } from '../ui/IconButton'
import { isActive, navItems } from './nav-items'

type SideNavProps = {
  appName: string
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  onNewGoal?: () => void
  onSearch?: () => void
  className?: string
}

/** Desktop navigation, collapsible to an icon rail. */
export function SideNav({
  appName,
  collapsed,
  onCollapsedChange,
  onNewGoal,
  onSearch,
  className,
}: SideNavProps) {
  const t = useTranslations('common.nav')
  const pathname = usePathname()

  return (
    <nav
      aria-label={t('label')}
      className={cn(
        'flex h-full flex-col gap-1 border-r border-line bg-card py-4 transition-[width] duration-200',
        collapsed ? 'w-16 items-center px-2' : 'w-60 px-3',
        className,
      )}
    >
      <div
        className={cn(
          'mb-4 flex items-center gap-2',
          collapsed ? 'flex-col' : 'justify-between pl-1',
        )}
      >
        <span className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-[10px] bg-accent font-display text-lg font-semibold text-ink-on-accent"
          >
            {appName.charAt(0)}
          </span>
          {!collapsed && <span className="font-display text-lg font-medium">{appName}</span>}
        </span>
        <IconButton
          label={collapsed ? t('expand') : t('collapse')}
          icon={collapsed ? <PanelLeft /> : <PanelLeftClose />}
          aria-expanded={!collapsed}
          onClick={() => onCollapsedChange(!collapsed)}
        />
      </div>

      <button
        type="button"
        onClick={onNewGoal}
        aria-keyshortcuts="N"
        aria-label={collapsed ? t('new') : undefined}
        title={collapsed ? t('new') : undefined}
        className={cn(
          'mb-2 flex min-h-11 cursor-pointer items-center gap-2.5 rounded-md bg-accent font-semibold text-ink-on-accent hover:brightness-95',
          collapsed ? 'size-11 justify-center' : 'px-3.5',
        )}
      >
        <Plus aria-hidden="true" className="size-5 stroke-2" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{t('new')}</span>
            <kbd className="rounded-sm bg-ink-on-accent/20 px-1.5 text-xs">{'N'}</kbd>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onSearch}
        aria-keyshortcuts="/"
        aria-label={collapsed ? t('search') : undefined}
        title={collapsed ? t('search') : undefined}
        className={cn(
          'flex min-h-11 cursor-pointer items-center gap-2.5 rounded-md text-ink-2 hover:bg-paper-2 hover:text-ink',
          collapsed ? 'size-11 justify-center' : 'px-3.5',
        )}
      >
        <Search aria-hidden="true" className="size-5 stroke-[1.75]" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{t('search')}</span>
            <kbd className="rounded-sm border border-line-strong px-1.5 text-xs">{'/'}</kbd>
          </>
        )}
      </button>

      <ul className="mt-2 grid gap-1">
        {navItems.map((nav) => {
          const active = isActive(pathname, nav.href)
          const Icon = nav.icon
          return (
            <li key={nav.href}>
              <Link
                href={nav.href}
                aria-current={active ? 'page' : undefined}
                aria-label={collapsed ? t(nav.key) : undefined}
                title={collapsed ? t(nav.key) : undefined}
                className={cn(
                  'flex min-h-11 items-center gap-2.5 rounded-md',
                  collapsed ? 'size-11 justify-center' : 'px-3.5',
                  active
                    ? 'bg-accent-soft font-bold text-accent-strong'
                    : 'text-ink-2 hover:bg-paper-2 hover:text-ink',
                )}
              >
                <Icon aria-hidden="true" className="size-5 stroke-[1.75]" />
                {!collapsed && t(nav.key)}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
