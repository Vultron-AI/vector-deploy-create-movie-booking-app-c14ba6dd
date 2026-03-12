/**
 * BookingConfirmation Component
 *
 * Display successful booking details with mock QR code/ticket.
 */

import type { Booking, Movie, Showtime, Theater } from '@/types'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDate, formatTime } from '@/data/mockData'
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  CheckCircle,
  Film,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BookingConfirmationProps {
  booking: Booking
  movie: Movie
  showtime: Showtime
  theater: Theater
  onViewBookings?: () => void
  onBookAnother?: () => void
  className?: string
}

export function BookingConfirmation({
  booking,
  movie,
  showtime,
  theater,
  onViewBookings,
  onBookAnother,
  className,
}: BookingConfirmationProps) {
  return (
    <div
      className={cn('max-w-lg mx-auto', className)}
      data-testid="booking-confirmation"
    >
      {/* Success header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[rgba(34,197,94,0.2)] mb-4">
          <CheckCircle className="h-8 w-8 text-[var(--color-success)]" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-fg)] mb-2">
          Booking Confirmed!
        </h1>
        <p className="text-[var(--color-fg-muted)]">
          Your tickets have been booked successfully
        </p>
      </div>

      {/* Ticket card */}
      <Card className="overflow-hidden">
        {/* Movie banner */}
        <div className="relative h-32 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)]">
          <div className="absolute inset-0 flex items-center justify-center">
            <Film className="h-12 w-12 text-white/30" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50">
            <div className="flex items-center gap-3">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-12 h-18 object-cover rounded-[var(--radius-sm)] border-2 border-white/30"
              />
              <div>
                <h2 className="font-bold text-white">{movie.title}</h2>
                <Badge variant="rating" size="sm">
                  {movie.rating}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <CardBody className="space-y-4">
          {/* Ticket details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-[var(--color-fg-muted)] mt-0.5" />
              <div>
                <p className="text-xs text-[var(--color-fg-muted)]">Date</p>
                <p className="font-medium text-[var(--color-fg)]">
                  {formatDate(showtime.date)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-[var(--color-fg-muted)] mt-0.5" />
              <div>
                <p className="text-xs text-[var(--color-fg-muted)]">Time</p>
                <p className="font-medium text-[var(--color-fg)]">
                  {formatTime(showtime.time)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-[var(--color-fg-muted)] mt-0.5" />
              <div>
                <p className="text-xs text-[var(--color-fg-muted)]">Theater</p>
                <p className="font-medium text-[var(--color-fg)]">
                  {theater.name}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Ticket className="h-4 w-4 text-[var(--color-fg-muted)] mt-0.5" />
              <div>
                <p className="text-xs text-[var(--color-fg-muted)]">Seats</p>
                <p className="font-medium text-[var(--color-fg)]">
                  {booking.seats.sort().join(', ')}
                </p>
              </div>
            </div>
          </div>

          {/* Divider with dashes */}
          <div className="relative py-2">
            <div className="absolute left-0 top-1/2 w-4 h-8 -translate-y-1/2 -translate-x-1/2 bg-[var(--color-bg)] rounded-r-full" />
            <div className="absolute right-0 top-1/2 w-4 h-8 -translate-y-1/2 translate-x-1/2 bg-[var(--color-bg)] rounded-l-full" />
            <div className="border-t-2 border-dashed border-[var(--color-border)]" />
          </div>

          {/* QR Code placeholder */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-32 h-32 bg-white rounded-[var(--radius-md)] p-2',
                'flex items-center justify-center'
              )}
            >
              {/* Mock QR code pattern */}
              <div className="w-full h-full grid grid-cols-8 gap-0.5">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'aspect-square',
                      Math.random() > 0.5 ? 'bg-black' : 'bg-white'
                    )}
                  />
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs text-[var(--color-fg-muted)]">
              Booking ID: {booking.id}
            </p>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-4 border-t border-[var(--color-border)]">
            <span className="text-[var(--color-fg-muted)]">Total Paid</span>
            <span className="text-xl font-bold text-[var(--color-accent)]">
              ${booking.totalPrice.toFixed(2)}
            </span>
          </div>
        </CardBody>
      </Card>

      {/* Action buttons */}
      <div className="flex gap-4 mt-6">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onViewBookings}
          data-testid="view-bookings-btn"
        >
          View My Bookings
        </Button>
        <Button
          className="flex-1"
          onClick={onBookAnother}
          data-testid="book-another-btn"
        >
          Book Another
        </Button>
      </div>
    </div>
  )
}
