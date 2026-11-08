'use client'

type Turnstile = {
  render: (
    el: HTMLElement,
    options: {
      sitekey: string
      appearance?: 'always' | 'execute' | 'interaction-only'
      callback: (token: string) => void
      'error-callback': () => void
    },
  ) => string
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: Turnstile
  }
}

let loading: Promise<void> | null = null

function loadScript() {
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('turnstile'))
    document.head.append(script)
  })
  return loading
}

/**
 * Invisible anti-abuse check before creating an anonymous session (D-030).
 * Returns undefined when Turnstile is not configured (local development).
 */
export async function getCaptchaToken(): Promise<string | undefined> {
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  if (!sitekey) return undefined
  await loadScript()
  const turnstile = window.turnstile
  if (!turnstile) return undefined
  return new Promise((resolve, reject) => {
    const host = document.createElement('div')
    host.style.position = 'fixed'
    host.style.bottom = '1rem'
    host.style.left = '1rem'
    host.style.zIndex = '60'
    document.body.append(host)
    const id = turnstile.render(host, {
      sitekey,
      appearance: 'interaction-only',
      callback: (token) => {
        turnstile.remove(id)
        host.remove()
        resolve(token)
      },
      'error-callback': () => {
        turnstile.remove(id)
        host.remove()
        reject(new Error('captcha'))
      },
    })
  })
}
