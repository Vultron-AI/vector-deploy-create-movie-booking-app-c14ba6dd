/**
 * SeatSelectionPage
 *
 * Seat selection for a showtime.
 */

import { useParams, useNavigate } from 'react-router-dom'
import { SeatSelector } from '@/components/seats'
import { useBooking } from '@/context'
import { getShowtimeById, getTheaterById, getMovieById } from '@/data/mockData'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function SeatSelectionPage() {
  const { showtimeId } = useParams<{ showtimeId: string }>()
  const navigate = useNavigate()
  const { selectedSeats, setSeats, selectShowtime, selectMovie } = useBooking()

  const showtime = showtimeId ? getShowtimeById(showtimeId) : null
  const theater = showtime ? getTheaterById(showtime.theaterId) : null
  const movie = showtime ? getMovieById(showtime.movieId) : null

  // Sync context if we navigated directly
  if (showtime && theater && movie) {
    if (!selectedSeats.length) {
      selectMovie(movie)
      selectShowtime(showtime, theater)
    }
  }

  if (!showtime || !theater || !movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-[var(--color-fg-muted)]">Showtime not found.</p>
      </div>
    )
  }

  const handleContinue = () => {
    navigate('/checkout')
  }

  return (
    <div
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      data-testid="seat-selection-page"
    >
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate(`/movie/${movie.id}`)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to {movie.title}
      </Button>

      <SeatSelector
        theater={theater}
        showtime={showtime}
        selectedSeats={selectedSeats}
        onSeatsChange={setSeats}
        onContinue={handleContinue}
      />
    </div>
  )
}
