'use client'

import type { HTMLAttributes, PointerEvent } from 'react'

/** True when the device or the app setting asks for fewer animations. */
export function motionReduced() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true
  return (
    document.documentElement.dataset.motion === 'reduced' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

const MAX_TILT = 8

/**
 * The card leans towards the pointer or the finger (± 8°) and its sheen follows
 * (D-063). Nothing moves when fewer animations are asked for.
 */
export function CardTilt({ children, style, ...props }: HTMLAttributes<HTMLElement>) {
  const move = (event: PointerEvent<HTMLElement>) => {
    if (motionReduced()) return
    const el = event.currentTarget
    const box = el.getBoundingClientRect()
    const x = (event.clientX - box.left) / box.width
    const y = (event.clientY - box.top) / box.height
    el.style.setProperty('--ry', `${((x - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${((0.5 - y) * 2 * MAX_TILT).toFixed(2)}deg`)
    el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
  }
  const reset = (event: PointerEvent<HTMLElement>) => {
    const el = event.currentTarget
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <article
      {...props}
      style={style}
      onPointerMove={move}
      onPointerDown={move}
      onPointerLeave={reset}
      onPointerUp={(e) => e.pointerType !== 'mouse' && reset(e)}
      onPointerCancel={reset}
    >
      {children}
    </article>
  )
}
