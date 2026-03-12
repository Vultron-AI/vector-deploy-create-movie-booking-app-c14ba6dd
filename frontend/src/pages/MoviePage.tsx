/**
 * MoviePage
 *
 * Display movie details and showtime selection.
 */

import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MovieDetail } from '@/components/movies'
import { ShowtimeSelector } from '@/components/showtimes'
import { useBooking } from '@/context'
import {
  getMovieById,
  getAvailableDates,
  getShowtimesByDate,
} from '@/data/mockData'
import type { Showtime, Theater } from '@/types'

export function MoviePage() {
  const { movieId } = useParams<{ movieId: string }>()
  const navigate = useNavigate()
  const { selectedMovie, selectedShowtime, selectMovie, selectShowtime } =
    useBooking()

  const movie = movieId ? getMovieById(movieId) : null

  // If we navigated directly here, set the movie
  useEffect(() => {
    if (movie && !selectedMovie) {
      selectMovie(movie)
    }
  }, [movie, selectedMovie, selectMovie])

  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-[var(--color-fg-muted)]">Movie not found.</p>
      </div>
    )
  }

  const availableDates = getAvailableDates(movie.id)

  const handleSelectShowtime = (showtime: Showtime, theater: Theater) => {
    selectShowtime(showtime, theater)
    navigate(`/seats/${showtime.id}`)
  }

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
      data-testid="movie-page"
    >
      <MovieDetail movie={movie} />

      <ShowtimeSelector
        availableDates={availableDates}
        showtimesByDate={(date) => getShowtimesByDate(movie.id, date)}
        onSelectShowtime={handleSelectShowtime}
        selectedShowtimeId={selectedShowtime?.id}
      />
    </div>
  )
}
