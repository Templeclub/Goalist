import type { CSSProperties } from 'react'

export type Tone = number | null | 'accent' | { status: number }

/** Data attributes + CSS variable that give an element its hue (see tokens.css). */
export function toneProps(tone: Tone): { 'data-tone': string; style?: CSSProperties } {
  if (tone === null) return { 'data-tone': 'neutral' }
  if (tone === 'accent') return { 'data-tone': 'accent' }
  if (typeof tone === 'object')
    return { 'data-tone': 'status', style: { ['--h' as string]: tone.status } }
  return { 'data-tone': 'hue', style: { ['--h' as string]: tone } }
}
