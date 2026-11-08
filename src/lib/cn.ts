import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl'],
      radius: ['sm', 'md', 'card', 'sheet'],
      shadow: ['card', 'sheet'],
    },
  },
})

/** Merge class names, resolving Tailwind conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
