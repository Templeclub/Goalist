import Image from 'next/image'
import { cn } from '@/lib/cn'

type BrandMarkProps = {
  /** Rendered width and height, in pixels. */
  size?: number
  /** Accessible name; leave empty when the product name is written next to the mark. */
  label?: string
  className?: string
}

/**
 * The Boosteur mark (D-065): two fanned cards, an orange one behind and a holographic « B » card
 * in front. A fixed brand asset (`public/icons/mark.svg`), the same drawing as the app icons.
 */
export function BrandMark({ size = 36, label = '', className }: BrandMarkProps) {
  return (
    <Image
      src="/icons/mark.svg"
      width={size}
      height={size}
      alt={label}
      aria-hidden={label ? undefined : true}
      unoptimized
      className={cn('shrink-0 select-none', className)}
    />
  )
}
