/**
 * Card Component
 *
 * A versatile card component with header, body, and footer variants.
 *
 * Usage:
 *   <Card>
 *     <CardHeader>Title</CardHeader>
 *     <CardBody>Content</CardBody>
 *     <CardFooter>Actions</CardFooter>
 *   </Card>
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantStyles = {
      default: 'bg-[var(--color-surface)] border border-[var(--color-border)]',
      elevated:
        'bg-[var(--color-surface-elevated)] shadow-[var(--shadow-lg)]',
      outlined: 'bg-transparent border border-[var(--color-border)]',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[var(--radius-lg)] overflow-hidden',
          variantStyles[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4 border-b border-[var(--color-border)]', className)}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-lg font-semibold text-[var(--color-fg)]',
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-[var(--color-fg-muted)]', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6', className)} {...props} />
  )
)
CardBody.displayName = 'CardBody'

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'px-6 py-4 border-t border-[var(--color-border)] flex items-center gap-4',
        className
      )}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
}
export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps }
