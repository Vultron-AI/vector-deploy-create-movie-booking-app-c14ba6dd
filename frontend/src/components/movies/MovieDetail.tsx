/**
 * MovieDetail Component
 *
 * Show full movie information including poster, description, duration, rating, and genres.
 */

import type { Movie } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Rating } from '@/components/ui/Rating'
import { formatDuration } from '@/data/mockData'
import { Clock, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MovieDetailProps {
  movie: Movie
  className?: string
}

export function MovieDetail({ movie, className }: MovieDetailProps) {
  return (
    <div
      className={cn('flex flex-col md:flex-row gap-8', className)}
      data-testid="movie-detail"
    >
      {/* Poster */}
      <div className="flex-shrink-0">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full md:w-72 rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)]"
        />
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="flex items-start gap-3 mb-4">
          <h1 className="text-3xl font-bold text-[var(--color-fg)]">
            {movie.title}
          </h1>
          <Badge variant="rating" size="lg">
            {movie.rating}
          </Badge>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <Rating score={movie.score} showStars size="lg" />
        </div>

        <div className="flex items-center gap-6 text-[var(--color-fg-muted)] mb-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span>{formatDuration(movie.duration)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span>{movie.releaseYear}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {movie.genres.map((genre) => (
            <Badge key={genre} variant="primary" size="lg">
              {genre}
            </Badge>
          ))}
        </div>

        <p className="text-[var(--color-fg-muted)] leading-relaxed text-lg">
          {movie.description}
        </p>
      </div>
    </div>
  )
}
