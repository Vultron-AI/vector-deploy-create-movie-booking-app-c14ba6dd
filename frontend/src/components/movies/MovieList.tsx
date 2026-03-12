/**
 * MovieList Component
 *
 * Display a grid of MovieCards.
 */

import type { Movie } from '@/types'
import { MovieCard } from './MovieCard'
import { cn } from '@/lib/utils'

export interface MovieListProps {
  movies: Movie[]
  onMovieClick?: (movie: Movie) => void
  className?: string
}

export function MovieList({ movies, onMovieClick, className }: MovieListProps) {
  return (
    <div
      className={cn(
        'grid gap-6',
        'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
        className
      )}
      data-testid="movie-list"
    >
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onClick={onMovieClick} />
      ))}
    </div>
  )
}
