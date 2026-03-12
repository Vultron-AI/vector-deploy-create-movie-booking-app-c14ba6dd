/**
 * Rating Component
 *
 * Display star ratings or numeric scores for movies.
 *
 * Usage:
 *   <Rating score={8.5} />
 *   <Rating score={7} showStars />
 *   <Rating score={9.2} size="lg" />
 */

import * as React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RatingProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number // 0-10 scale
  showStars?: boolean
  maxStars?: number
  size?: 'sm' | 'default' | 'lg'
}

const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      className,
      score,
      showStars = false,
      maxStars = 5,
      size = 'default',
      ...props
    },
    ref
  ) => {
    // Convert 0-10 score to star rating (0-5)
    const starRating = (score / 10) * maxStars
    const fullStars = Math.floor(starRating)
    const hasHalfStar = starRating - fullStars >= 0.5

    const sizeStyles = {
      sm: { icon: 'h-3 w-3', text: 'text-xs' },
      default: { icon: 'h-4 w-4', text: 'text-sm' },
      lg: { icon: 'h-5 w-5', text: 'text-base' },
    }

    if (showStars) {
      return (
        <div
          ref={ref}
          className={cn('flex items-center gap-0.5', className)}
          {...props}
        >
          {Array.from({ length: maxStars }).map((_, i) => {
            const isFilled = i < fullStars
            const isHalf = i === fullStars && hasHalfStar

            return (
              <div key={i} className="relative">
                {/* Background star (empty) */}
                <Star
                  className={cn(
                    sizeStyles[size].icon,
                    'text-[var(--color-fg-subtle)]'
                  )}
                  fill="none"
                />
                {/* Foreground star (filled or half) */}
                {(isFilled || isHalf) && (
                  <Star
                    className={cn(
                      sizeStyles[size].icon,
                      'absolute inset-0 text-[var(--color-warning)]',
                      isHalf && 'clip-path-half'
                    )}
                    fill="currentColor"
                    style={
                      isHalf
                        ? { clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }
                        : undefined
                    }
                  />
                )}
              </div>
            )
          })}
          <span
            className={cn(
              'ml-1 font-medium text-[var(--color-fg)]',
              sizeStyles[size].text
            )}
          >
            {score.toFixed(1)}
          </span>
        </div>
      )
    }

    // Numeric display
    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-1', className)}
        {...props}
      >
        <Star
          className={cn(sizeStyles[size].icon, 'text-[var(--color-warning)]')}
          fill="currentColor"
        />
        <span
          className={cn(
            'font-semibold text-[var(--color-fg)]',
            sizeStyles[size].text
          )}
        >
          {score.toFixed(1)}
        </span>
      </div>
    )
  }
)
Rating.displayName = 'Rating'

export { Rating }
