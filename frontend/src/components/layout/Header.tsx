/**
 * Header Component
 *
 * Navigation header with app title and links.
 */

import { Link, useLocation } from 'react-router-dom'
import { Film, Ticket } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Header() {
  const location = useLocation()

  return (
    <header
      className={cn(
        'sticky top-0 z-50',
        'bg-[var(--color-surface)] border-b border-[var(--color-border)]',
        'backdrop-blur-sm bg-opacity-90'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-[var(--color-fg)] hover:text-[var(--color-accent)] transition-colors"
          >
            <Film className="h-6 w-6" />
            <span className="font-bold text-lg">CineBook</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            <Link
              to="/my-bookings"
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)]',
                'text-sm font-medium transition-colors',
                location.pathname === '/my-bookings'
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-elevated)]'
              )}
              data-testid="my-bookings-link"
            >
              <Ticket className="h-4 w-4" />
              <span>My Bookings</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
