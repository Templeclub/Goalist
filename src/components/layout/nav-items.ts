import { BookOpen, House, User, type LucideIcon } from 'lucide-react'

export type NavItem = { href: string; key: 'home' | 'goals' | 'me'; icon: LucideIcon }

export const navItems: readonly NavItem[] = [
  { href: '/home', key: 'home', icon: House },
  { href: '/goals', key: 'goals', icon: BookOpen },
  { href: '/me', key: 'me', icon: User },
]

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}
