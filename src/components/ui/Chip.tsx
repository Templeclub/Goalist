import { Check, Plus } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { chipBase, chipCheck } from './chip-styles'

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Toggle chip when defined; action chip otherwise. */
  pressed?: boolean
  /** "add" chips use a dashed border and a leading plus (e.g. "+ Autre…"). */
  variant?: 'default' | 'add'
  icon?: ReactNode
}

/** A standalone chip button: toggle (aria-pressed) or action ("+ Ajouter…"). */
export function Chip({
  pressed,
  variant = 'default',
  icon,
  className,
  children,
  type = 'button',
  ...props
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={pressed}
      className={cn(chipBase, variant === 'add' && 'border-dashed text-ink-2', className)}
      {...props}
    >
      {pressed !== undefined && <Check aria-hidden="true" className={chipCheck} />}
      {variant === 'add' && <Plus aria-hidden="true" className="size-4 stroke-2" />}
      {icon && (
        <span aria-hidden="true" className="[&>svg]:size-4 [&>svg]:stroke-[1.75]">
          {icon}
        </span>
      )}
      {children}
    </button>
  )
}
