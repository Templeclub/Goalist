import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-md text-center font-semibold select-none',
    'transition-[background-color,filter,color] duration-150 ease-out',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-accent text-ink-on-accent hover:brightness-95 active:brightness-90',
        secondary: 'border border-line-strong text-ink hover:bg-paper-2',
        ghost: 'text-ink-2 hover:bg-paper-2 hover:text-ink',
        danger: 'bg-danger text-ink-on-accent hover:brightness-95',
      },
      size: {
        md: 'min-h-13 px-5 text-base',
        sm: 'min-h-11 px-4 text-[0.9375rem]',
      },
      block: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', block: false },
  },
)

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

/** Primary, secondary, ghost or danger (destructive actions only) button. */
export function Button({
  className,
  variant,
  size,
  block,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  )
}
