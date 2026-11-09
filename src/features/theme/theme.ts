/*
 * Theme and card animations chosen in « Moi » (D-063). Stored on the device for an
 * instant first paint, and the theme also on the profile so it follows the account.
 */

export const themes = ['system', 'light', 'dark'] as const
export type Theme = (typeof themes)[number]

export const THEME_KEY = 'elan:theme'
export const MOTION_KEY = 'elan:motion'

export const isTheme = (value: unknown): value is Theme =>
  typeof value === 'string' && (themes as readonly string[]).includes(value)

/** Runs in <head> before the first paint: no flash of the wrong theme. */
export const themeScript = `(function(){try{var d=document.documentElement,t=localStorage.getItem('${THEME_KEY}');if(t==='light'||t==='dark')d.dataset.theme=t;if(localStorage.getItem('${MOTION_KEY}')==='reduced')d.dataset.motion='reduced'}catch(e){}})()`

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'system') delete root.dataset.theme
  else root.dataset.theme = theme
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {}
}

export function applyMotion(enabled: boolean) {
  const root = document.documentElement
  if (enabled) delete root.dataset.motion
  else root.dataset.motion = 'reduced'
  try {
    if (enabled) localStorage.removeItem(MOTION_KEY)
    else localStorage.setItem(MOTION_KEY, 'reduced')
  } catch {}
}

export function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_KEY)
    return isTheme(value) ? value : null
  } catch {
    return null
  }
}

export function storedMotion(): boolean {
  try {
    return localStorage.getItem(MOTION_KEY) !== 'reduced'
  } catch {
    return true
  }
}
