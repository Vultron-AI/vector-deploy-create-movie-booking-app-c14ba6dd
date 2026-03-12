/**
 * ConfirmationPage
 *
 * Display booking confirmation with ticket details.
 */

import { useParams, useNavigate } from 'react-router-dom'
import { BookingConfirmation } from '@/components/booking'
import { useBooking } from '@/context'
import { getMovieById, getShowtimeById, getTheaterById } from '@/data/mockData'

export function ConfirmationPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const navigate = useNavigate()
  const { getBookingById, lastBooking } = useBooking()

  // Try to get the booking from context or localStorage
  const booking = bookingId
    ? getBookingById(bookingId) || lastBooking
    : lastBooking

  if (!booking) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-[var(--color-fg-muted)]">Booking not found.</p>
      </div>
    )
  }

  const movie = getMovieById(booking.movieId)
  const showtime = getShowtimeById(booking.showtimeId)
  const theater = getTheaterById(booking.theaterId)

  if (!movie || !showtime || !theater) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-[var(--color-fg-muted)]">
          Booking details not found.
        </p>
      </div>
    )
  }

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      data-testid="confirmation-page"
    >
      <BookingConfirmation
        booking={booking}
        movie={movie}
        showtime={showtime}
        theater={theater}
        onViewBookings={() => navigate('/my-bookings')}
        onBookAnother={() => navigate('/')}
      />
    </div>
  )
}
