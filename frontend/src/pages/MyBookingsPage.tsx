/**
 * MyBookingsPage
 *
 * Display all completed bookings with empty state.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooking } from '@/context'
import { Card, CardBody, Button, Spinner, EmptyState } from '@/components/ui'
import { Badge } from '@/components/ui/Badge'
import {
  getMovieById,
  getShowtimeById,
  getTheaterById,
  formatDate,
  formatTime,
} from '@/data/mockData'
import { Calendar, Clock, MapPin, Ticket } from 'lucide-react'

export function MyBookingsPage() {
  const navigate = useNavigate()
  const { completedBookings } = useBooking()
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  // Sort bookings by date (most recent first)
  const sortedBookings = [...completedBookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[300px]">
          <Spinner className="h-8 w-8 text-[var(--color-accent)]" />
        </div>
      </div>
    )
  }

  return (
    <div
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      data-testid="my-bookings-page"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-fg)]">
          My Bookings
        </h1>
        <p className="text-[var(--color-fg-muted)] mt-2">
          {completedBookings.length > 0
            ? `You have ${completedBookings.length} booking${completedBookings.length > 1 ? 's' : ''}`
            : 'No bookings yet'}
        </p>
      </div>

      {sortedBookings.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<Ticket className="h-12 w-12" />}
              title="No Bookings Yet"
              description="You haven't made any bookings yet. Browse movies to get started."
              action={
                <Button onClick={() => navigate('/')} data-testid="browse-movies-btn">
                  Browse Movies
                </Button>
              }
            />
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedBookings.map((booking) => {
            const movie = getMovieById(booking.movieId)
            const showtime = getShowtimeById(booking.showtimeId)
            const theater = getTheaterById(booking.theaterId)

            if (!movie || !showtime || !theater) return null

            return (
              <Card key={booking.id} data-testid={`booking-${booking.id}`}>
                <CardBody>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Movie poster */}
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-20 h-30 object-cover rounded-[var(--radius-md)]"
                    />

                    {/* Booking details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-[var(--color-fg)]">
                            {movie.title}
                          </h3>
                          <Badge variant="rating" size="sm" className="mt-1">
                            {movie.rating}
                          </Badge>
                        </div>
                        <span className="text-lg font-bold text-[var(--color-accent)]">
                          ${booking.totalPrice.toFixed(2)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm text-[var(--color-fg-muted)]">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(showtime.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(showtime.time)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{theater.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4" />
                          <span>{booking.seats.sort().join(', ')}</span>
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-[var(--color-fg-subtle)]">
                        Booking ID: {booking.id}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
