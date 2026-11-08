import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children'> & {
  /** Accessible name: required because the button has no visible text. */
  label: string
  icon: ReactNode
  tone?: 'default' | 'accent'
}

/** 44 × 44 px icon-only button. */
export function IconButton({
  label,
  icon,
  tone = 'default',
  className,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-grid size-11 shrink-0 place-items-center rounded-md transition-colors duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        tone === 'default' && 'text-ink-2 hover:bg-paper-2 hover:text-ink',
        tone === 'accent' && 'bg-accent-soft text-accent-strong hover:brightness-95',
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="[&>svg]:size-5 [&>svg]:stroke-[1.75]">
        {icon}
      </span>
    </button>
  )
}
