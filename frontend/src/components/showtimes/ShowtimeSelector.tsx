/**
 * ShowtimeSelector Component
 *
 * Display available dates and times for a movie, allowing users to select a showtime.
 */

import { useState } from 'react'
import type { Showtime, Theater } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  formatDate,
  formatTime,
  getTheaterById,
} from '@/data/mockData'
import { cn } from '@/lib/utils'

export interface ShowtimeSelectorProps {
  availableDates: string[]
  showtimesByDate: (date: string) => Showtime[]
  onSelectShowtime?: (showtime: Showtime, theater: Theater) => void
  selectedShowtimeId?: string
  className?: string
}

export function ShowtimeSelector({
  availableDates,
  showtimesByDate,
  onSelectShowtime,
  selectedShowtimeId,
  className,
}: ShowtimeSelectorProps) {
  const [selectedDate, setSelectedDate] = useState(availableDates[0] || '')

  const currentShowtimes = selectedDate ? showtimesByDate(selectedDate) : []

  // Group showtimes by theater
  const showtimesByTheater = currentShowtimes.reduce(
    (acc, showtime) => {
      const theater = getTheaterById(showtime.theaterId)
      if (!theater) return acc

      if (!acc[theater.id]) {
        acc[theater.id] = {
          theater,
          showtimes: [],
        }
      }
      acc[theater.id].showtimes.push(showtime)
      return acc
    },
    {} as Record<string, { theater: Theater; showtimes: Showtime[] }>
  )

  return (
    <Card className={className} data-testid="showtime-selector">
      <CardHeader>
        <CardTitle>Select Showtime</CardTitle>
      </CardHeader>
      <CardBody className="space-y-6">
        {/* Date tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {availableDates.map((date) => (
            <Button
              key={date}
              variant={selectedDate === date ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDate(date)}
              className="flex-shrink-0"
              data-testid={`date-tab-${date}`}
            >
              {formatDate(date)}
            </Button>
          ))}
        </div>

        {/* Showtimes by theater */}
        {Object.values(showtimesByTheater).length === 0 ? (
          <p className="text-[var(--color-fg-muted)] text-center py-4">
            No showtimes available for this date.
          </p>
        ) : (
          <div className="space-y-6">
            {Object.values(showtimesByTheater).map(({ theater, showtimes }) => (
              <div key={theater.id}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-[var(--color-fg)]">
                    {theater.name}
                  </h4>
                  <span className="text-sm text-[var(--color-fg-muted)]">
                    ${theater.seatPrice.toFixed(2)} / seat
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {showtimes
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((showtime) => {
                      const isSelected = showtime.id === selectedShowtimeId

                      return (
                        <Button
                          key={showtime.id}
                          variant={isSelected ? 'default' : 'secondary'}
                          size="sm"
                          onClick={() => onSelectShowtime?.(showtime, theater)}
                          className={cn(
                            'min-w-[80px]',
                            isSelected && 'ring-2 ring-[var(--color-accent)]'
                          )}
                          data-testid={`showtime-${showtime.id}`}
                        >
                          {formatTime(showtime.time)}
                        </Button>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  )
}
