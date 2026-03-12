/**
 * HomePage
 *
 * Displays the movie list with loading state.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MovieList } from '@/components/movies'
import { useBooking } from '@/context'
import { movies } from '@/data/mockData'
import { Spinner, EmptyState } from '@/components/ui'
import { Film } from 'lucide-react'
import type { Movie } from '@/types'

export function HomePage() {
  const navigate = useNavigate()
  const { selectMovie } = useBooking()
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleMovieClick = (movie: Movie) => {
    selectMovie(movie)
    navigate(`/movie/${movie.id}`)
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner className="h-8 w-8 text-[var(--color-accent)]" />
        </div>
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmptyState
          icon={<Film className="h-12 w-12" />}
          title="No Movies Available"
          description="There are no movies showing at the moment. Please check back later."
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="home-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-fg)]">
          Blockbusters are now Showing. These are the top blockbusters.
        </h1>
        <p className="text-[var(--color-fg-muted)] mt-2">
          Select a movie to book tickets
        </p>
      </div>

      <MovieList movies={movies} onMovieClick={handleMovieClick} />
    </div>
  )
}
