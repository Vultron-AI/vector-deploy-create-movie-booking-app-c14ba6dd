/**
 * Badge Component
 *
 * Display labels for ratings, genres, and status indicators.
 *
 * Usage:
 *   <Badge>Default</Badge>
 *   <Badge variant="success">Confirmed</Badge>
 *   <Badge variant="rating">PG-13</Badge>
 */

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-[var(--radius-full)] px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--color-surface-elevated)] text-[var(--color-fg)]',
        primary:
          'bg-[var(--color-accent-muted)] text-[var(--color-accent)]',
        success:
          'bg-[rgba(34,197,94,0.2)] text-[var(--color-success)]',
        warning:
          'bg-[rgba(245,158,11,0.2)] text-[var(--color-warning)]',
        error:
          'bg-[rgba(239,68,68,0.2)] text-[var(--color-error)]',
        rating:
          'bg-[var(--color-surface)] text-[var(--color-fg)] border border-[var(--color-border)]',
        genre:
          'bg-[var(--color-surface-elevated)] text-[var(--color-fg-muted)]',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        default: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
)
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
