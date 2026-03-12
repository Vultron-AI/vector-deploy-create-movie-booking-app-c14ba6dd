/**
 * MovieCard Component
 *
 * Display a single movie with poster, title, rating, duration, and genre badges.
 */

import type { Movie } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Rating } from '@/components/ui/Rating'
import { formatDuration } from '@/data/mockData'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MovieCardProps {
  movie: Movie
  onClick?: (movie: Movie) => void
  className?: string
}

export function MovieCard({ movie, onClick, className }: MovieCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-[var(--transition-base)]',
        'hover:scale-[1.02] hover:shadow-[var(--shadow-xl)]',
        'group',
        className
      )}
      onClick={() => onClick?.(movie)}
      data-testid={`movie-card-${movie.id}`}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="h-full w-full object-cover transition-transform duration-[var(--transition-slow)] group-hover:scale-105"
        />
        {/* Rating overlay */}
        <div className="absolute top-2 right-2">
          <Badge variant="rating">{movie.rating}</Badge>
        </div>
        {/* Score overlay */}
        <div className="absolute bottom-2 left-2 bg-black/70 rounded-[var(--radius-md)] px-2 py-1">
          <Rating score={movie.score} size="sm" />
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-[var(--color-fg)] truncate mb-2">
          {movie.title}
        </h3>

        <div className="flex items-center gap-2 text-[var(--color-fg-muted)] text-sm mb-3">
          <Clock className="h-4 w-4" />
          <span>{formatDuration(movie.duration)}</span>
          <span className="text-[var(--color-fg-subtle)]">|</span>
          <span>{movie.releaseYear}</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {movie.genres.slice(0, 2).map((genre) => (
            <Badge key={genre} variant="genre" size="sm">
              {genre}
            </Badge>
          ))}
          {movie.genres.length > 2 && (
            <Badge variant="genre" size="sm">
              +{movie.genres.length - 2}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  )
}
