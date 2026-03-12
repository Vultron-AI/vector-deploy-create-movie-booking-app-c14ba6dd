/**
 * BookingSummary Component
 *
 * Display selected movie, showtime, seats, and total price.
 */

import type { Movie, Showtime, Theater } from '@/types'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate, formatTime } from '@/data/mockData'
import { Calendar, Clock, MapPin, Ticket } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BookingSummaryProps {
  movie: Movie
  showtime: Showtime
  theater: Theater
  selectedSeats: string[]
  className?: string
}

export function BookingSummary({
  movie,
  showtime,
  theater,
  selectedSeats,
  className,
}: BookingSummaryProps) {
  const totalPrice = selectedSeats.length * theater.seatPrice

  return (
    <Card className={className} data-testid="booking-summary">
      <CardHeader>
        <CardTitle>Booking Summary</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        {/* Movie info */}
        <div className="flex gap-4">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-16 h-24 object-cover rounded-[var(--radius-md)]"
          />
          <div>
            <h4 className="font-semibold text-[var(--color-fg)]">
              {movie.title}
            </h4>
            <Badge variant="rating" size="sm" className="mt-1">
              {movie.rating}
            </Badge>
          </div>
        </div>

        {/* Showtime details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-[var(--color-fg-muted)]">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(showtime.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--color-fg-muted)]">
            <Clock className="h-4 w-4" />
            <span>{formatTime(showtime.time)}</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--color-fg-muted)]">
            <MapPin className="h-4 w-4" />
            <span>{theater.name}</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--color-fg-muted)]">
            <Ticket className="h-4 w-4" />
            <span>{selectedSeats.sort().join(', ')}</span>
          </div>
        </div>

        {/* Price breakdown */}
        <div
          className={cn(
            'pt-4 border-t border-[var(--color-border)]',
            'space-y-2'
          )}
        >
          <div className="flex justify-between text-sm text-[var(--color-fg-muted)]">
            <span>
              {selectedSeats.length} x Ticket ({theater.name})
            </span>
            <span>
              ${theater.seatPrice.toFixed(2)} each
            </span>
          </div>
          <div className="flex justify-between font-semibold text-[var(--color-fg)]">
            <span>Total</span>
            <span className="text-lg text-[var(--color-accent)]">
              ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
