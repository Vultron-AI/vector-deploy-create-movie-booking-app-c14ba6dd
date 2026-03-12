/**
 * SeatSelector Component
 *
 * Wrapper component that manages seat selection state with legend and price display.
 */

import type { Theater, Showtime } from '@/types'
import { SeatMap } from './SeatMap'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export interface SeatSelectorProps {
  theater: Theater
  showtime: Showtime
  selectedSeats: string[]
  onSeatsChange: (seats: string[]) => void
  onContinue?: () => void
  className?: string
}

export function SeatSelector({
  theater,
  showtime,
  selectedSeats,
  onSeatsChange,
  onContinue,
  className,
}: SeatSelectorProps) {
  const handleSeatClick = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      onSeatsChange(selectedSeats.filter((s) => s !== seatId))
    } else {
      onSeatsChange([...selectedSeats, seatId])
    }
  }

  const totalPrice = selectedSeats.length * theater.seatPrice

  return (
    <Card className={className} data-testid="seat-selector">
      <CardHeader>
        <CardTitle>Select Your Seats</CardTitle>
      </CardHeader>
      <CardBody className="space-y-6">
        {/* Legend */}
        <div className="flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-t-lg bg-[var(--color-surface-elevated)]" />
            <span className="text-sm text-[var(--color-fg-muted)]">
              Available
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-t-lg bg-[var(--color-accent)]" />
            <span className="text-sm text-[var(--color-fg-muted)]">
              Selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-t-lg bg-[var(--color-fg-subtle)] opacity-50" />
            <span className="text-sm text-[var(--color-fg-muted)]">Taken</span>
          </div>
        </div>

        {/* Seat Map */}
        <div className="overflow-x-auto py-4">
          <SeatMap
            rows={theater.rows}
            seatsPerRow={theater.seatsPerRow}
            takenSeats={showtime.takenSeats}
            selectedSeats={selectedSeats}
            onSeatClick={handleSeatClick}
          />
        </div>

        {/* Selection summary */}
        <div
          className={cn(
            'flex flex-col sm:flex-row items-center justify-between gap-4',
            'p-4 bg-[var(--color-surface-elevated)] rounded-[var(--radius-md)]'
          )}
        >
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <div className="text-sm text-[var(--color-fg-muted)]">
              Selected:{' '}
              <span className="font-medium text-[var(--color-fg)]">
                {selectedSeats.length > 0
                  ? selectedSeats.sort().join(', ')
                  : 'None'}
              </span>
            </div>
            <div className="hidden sm:block text-[var(--color-fg-subtle)]">
              |
            </div>
            <div className="text-sm text-[var(--color-fg-muted)]">
              Price:{' '}
              <span className="font-semibold text-[var(--color-fg)] text-lg">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
          <Button
            onClick={onContinue}
            disabled={selectedSeats.length === 0}
            data-testid="continue-to-checkout"
          >
            Continue to Checkout
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
