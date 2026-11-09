import { House, Layers, Sparkles, User, Users, type LucideIcon } from 'lucide-react'

export type NavItem = {
  href: string
  key: 'home' | 'goals' | 'collection' | 'friends' | 'me'
  icon: LucideIcon
}

export const navItems: readonly NavItem[] = [
  { href: '/home', key: 'home', icon: House },
  { href: '/goals', key: 'goals', icon: Layers },
  { href: '/collection', key: 'collection', icon: Sparkles },
  { href: '/friends', key: 'friends', icon: Users },
  { href: '/me', key: 'me', icon: User },
]

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}
