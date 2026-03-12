/**
 * EmptyState Component
 *
 * Display a placeholder when no content is available.
 */

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
      data-testid="empty-state"
    >
      {icon && (
        <div className="mb-4 text-[var(--color-fg-subtle)]">{icon}</div>
      )}
      <h3 className="text-lg font-semibold text-[var(--color-fg)] mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-[var(--color-fg-muted)] max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
