/**
 * CheckoutPage
 *
 * Payment and booking confirmation.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookingSummary, CheckoutForm } from '@/components/booking'
import type { CheckoutFormData } from '@/components/booking'
import { useBooking } from '@/context'
import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'

export function CheckoutPage() {
  const navigate = useNavigate()
  const {
    selectedMovie,
    selectedShowtime,
    selectedTheater,
    selectedSeats,
    completeBooking,
  } = useBooking()
  const [isLoading, setIsLoading] = useState(false)

  if (!selectedMovie || !selectedShowtime || !selectedTheater) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-[var(--color-fg-muted)]">
          No booking in progress.{' '}
          <Button variant="link" onClick={() => navigate('/')}>
            Browse movies
          </Button>
        </p>
      </div>
    )
  }

  if (selectedSeats.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-[var(--color-fg-muted)]">
          No seats selected.{' '}
          <Button
            variant="link"
            onClick={() => navigate(`/seats/${selectedShowtime.id}`)}
          >
            Select seats
          </Button>
        </p>
      </div>
    )
  }

  const handleSubmit = (data: CheckoutFormData) => {
    setIsLoading(true)

    // Simulate payment processing
    setTimeout(() => {
      const booking = completeBooking(data.cardName, data.email)
      navigate(`/confirmation/${booking.id}`)
    }, 1500)
  }

  return (
    <div
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      data-testid="checkout-page"
    >
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate(`/seats/${selectedShowtime.id}`)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to seat selection
      </Button>

      <h1 className="text-2xl font-bold text-[var(--color-fg)] mb-6">
        Complete Your Booking
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        <CheckoutForm onSubmit={handleSubmit} isLoading={isLoading} />
        <BookingSummary
          movie={selectedMovie}
          showtime={selectedShowtime}
          theater={selectedTheater}
          selectedSeats={selectedSeats}
        />
      </div>
    </div>
  )
}
