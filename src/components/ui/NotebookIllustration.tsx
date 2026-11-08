import { cn } from '@/lib/cn'

/** Line illustration: an open notebook, a feather and a bookmark ribbon. Decorative. */
export function NotebookIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 150"
      aria-hidden="true"
      className={cn('h-auto w-full max-w-[220px] text-ink-2', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* pages */}
      <path d="M110 34c-18-10-48-12-78-6v92c30-6 60-4 78 6" />
      <path d="M110 34c18-10 48-12 78-6v92c-30-6-60-4-78 6" />
      <path d="M110 34v92" />
      {/* ruled lines, left page */}
      <path d="M46 52c16-2 32-1 48 3M46 66c16-2 32-1 48 3M46 80c12-1 22-1 34 1" opacity="0.55" />
      {/* right page: a little star and lines */}
      <path d="M128 56c14-3 30-3 44-1M128 70c10-2 22-2 32-1" opacity="0.55" />
      <path d="M150 92l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6-4.5-4 6-1z" opacity="0.8" />
      {/* bookmark ribbon */}
      <path
        d="M160 28v34l-6-5-6 5V29"
        className="text-accent"
        stroke="var(--accent)"
        fill="var(--accent-soft)"
      />
      {/* feather */}
      <path d="M58 132c14-30 40-52 70-62-8 18-26 40-56 56" />
      <path d="M58 132l30-34" opacity="0.7" />
    </svg>
  )
}
