/**
 * SeatMap Component
 *
 * Render a visual grid of theater seats with screen indicator.
 */

import type { SeatStatus } from '@/types'
import { cn } from '@/lib/utils'

export interface SeatMapProps {
  rows: number
  seatsPerRow: number
  takenSeats: string[]
  selectedSeats: string[]
  onSeatClick?: (seatId: string) => void
  className?: string
}

const ROW_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function SeatMap({
  rows,
  seatsPerRow,
  takenSeats,
  selectedSeats,
  onSeatClick,
  className,
}: SeatMapProps) {
  const getSeatStatus = (seatId: string): SeatStatus => {
    if (takenSeats.includes(seatId)) return 'taken'
    if (selectedSeats.includes(seatId)) return 'selected'
    return 'available'
  }

  const seatStatusStyles: Record<SeatStatus, string> = {
    available:
      'bg-[var(--color-surface-elevated)] hover:bg-[var(--color-accent-muted)] cursor-pointer',
    selected:
      'bg-[var(--color-accent)] text-white cursor-pointer',
    taken:
      'bg-[var(--color-fg-subtle)] opacity-50 cursor-not-allowed',
  }

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Screen */}
      <div className="w-full max-w-md mb-8">
        <div className="h-2 bg-[var(--color-accent)] rounded-full mb-2" />
        <p className="text-center text-sm text-[var(--color-fg-muted)]">
          SCREEN
        </p>
      </div>

      {/* Seat grid */}
      <div className="flex flex-col gap-2" data-testid="seat-map">
        {Array.from({ length: rows }).map((_, rowIndex) => {
          const rowLetter = ROW_LETTERS[rowIndex]

          return (
            <div key={rowLetter} className="flex items-center gap-2">
              {/* Row label */}
              <span className="w-6 text-center text-sm font-medium text-[var(--color-fg-muted)]">
                {rowLetter}
              </span>

              {/* Seats */}
              <div className="flex gap-1">
                {Array.from({ length: seatsPerRow }).map((_, seatIndex) => {
                  const seatNumber = seatIndex + 1
                  const seatId = `${rowLetter}${seatNumber}`
                  const status = getSeatStatus(seatId)

                  return (
                    <button
                      key={seatId}
                      type="button"
                      className={cn(
                        'w-8 h-8 rounded-t-lg text-xs font-medium transition-all duration-[var(--transition-fast)]',
                        seatStatusStyles[status]
                      )}
                      onClick={() => {
                        if (status !== 'taken') {
                          onSeatClick?.(seatId)
                        }
                      }}
                      disabled={status === 'taken'}
                      title={`${seatId} - ${status}`}
                      data-testid={`seat-${seatId}`}
                      aria-label={`Seat ${seatId}, ${status}`}
                    >
                      {seatNumber}
                    </button>
                  )
                })}
              </div>

              {/* Row label (right side) */}
              <span className="w-6 text-center text-sm font-medium text-[var(--color-fg-muted)]">
                {rowLetter}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
