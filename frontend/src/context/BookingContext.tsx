/**
 * BookingContext
 *
 * Manages booking flow state: selected movie, showtime, seats, and completed bookings.
 * Persists completed bookings to localStorage.
 */

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from 'react'
import type { Movie, Showtime, Theater, Booking } from '@/types'

const STORAGE_KEY = 'movie-booking-history'

interface BookingState {
  selectedMovie: Movie | null
  selectedShowtime: Showtime | null
  selectedTheater: Theater | null
  selectedSeats: string[]
  completedBookings: Booking[]
  lastBooking: Booking | null
}

type BookingAction =
  | { type: 'SELECT_MOVIE'; payload: Movie }
  | { type: 'SELECT_SHOWTIME'; payload: { showtime: Showtime; theater: Theater } }
  | { type: 'SET_SEATS'; payload: string[] }
  | { type: 'COMPLETE_BOOKING'; payload: Booking }
  | { type: 'RESET_SELECTION' }
  | { type: 'LOAD_BOOKINGS'; payload: Booking[] }

const initialState: BookingState = {
  selectedMovie: null,
  selectedShowtime: null,
  selectedTheater: null,
  selectedSeats: [],
  completedBookings: [],
  lastBooking: null,
}

function bookingReducer(
  state: BookingState,
  action: BookingAction
): BookingState {
  switch (action.type) {
    case 'SELECT_MOVIE':
      return {
        ...state,
        selectedMovie: action.payload,
        selectedShowtime: null,
        selectedTheater: null,
        selectedSeats: [],
      }

    case 'SELECT_SHOWTIME':
      return {
        ...state,
        selectedShowtime: action.payload.showtime,
        selectedTheater: action.payload.theater,
        selectedSeats: [],
      }

    case 'SET_SEATS':
      return {
        ...state,
        selectedSeats: action.payload,
      }

    case 'COMPLETE_BOOKING':
      return {
        ...state,
        completedBookings: [...state.completedBookings, action.payload],
        lastBooking: action.payload,
        selectedMovie: null,
        selectedShowtime: null,
        selectedTheater: null,
        selectedSeats: [],
      }

    case 'RESET_SELECTION':
      return {
        ...state,
        selectedMovie: null,
        selectedShowtime: null,
        selectedTheater: null,
        selectedSeats: [],
        lastBooking: null,
      }

    case 'LOAD_BOOKINGS':
      return {
        ...state,
        completedBookings: action.payload,
      }

    default:
      return state
  }
}

interface BookingContextValue extends BookingState {
  selectMovie: (movie: Movie) => void
  selectShowtime: (showtime: Showtime, theater: Theater) => void
  setSeats: (seats: string[]) => void
  completeBooking: (customerName: string, customerEmail: string) => Booking
  resetSelection: () => void
  getBookingById: (id: string) => Booking | undefined
}

const BookingContext = createContext<BookingContextValue | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState)

  // Load bookings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const bookings = JSON.parse(stored) as Booking[]
        dispatch({ type: 'LOAD_BOOKINGS', payload: bookings })
      } catch {
        // Invalid data, ignore
      }
    }
  }, [])

  // Save bookings to localStorage when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.completedBookings))
  }, [state.completedBookings])

  const selectMovie = (movie: Movie) => {
    dispatch({ type: 'SELECT_MOVIE', payload: movie })
  }

  const selectShowtime = (showtime: Showtime, theater: Theater) => {
    dispatch({ type: 'SELECT_SHOWTIME', payload: { showtime, theater } })
  }

  const setSeats = (seats: string[]) => {
    dispatch({ type: 'SET_SEATS', payload: seats })
  }

  const completeBooking = (
    customerName: string,
    customerEmail: string
  ): Booking => {
    if (!state.selectedMovie || !state.selectedShowtime || !state.selectedTheater) {
      throw new Error('Cannot complete booking without selection')
    }

    const booking: Booking = {
      id: `BK-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      movieId: state.selectedMovie.id,
      showtimeId: state.selectedShowtime.id,
      theaterId: state.selectedTheater.id,
      seats: state.selectedSeats,
      totalPrice: state.selectedSeats.length * state.selectedTheater.seatPrice,
      customerName,
      customerEmail,
      createdAt: new Date().toISOString(),
    }

    dispatch({ type: 'COMPLETE_BOOKING', payload: booking })
    return booking
  }

  const resetSelection = () => {
    dispatch({ type: 'RESET_SELECTION' })
  }

  const getBookingById = (id: string): Booking | undefined => {
    return state.completedBookings.find((b) => b.id === id)
  }

  return (
    <BookingContext.Provider
      value={{
        ...state,
        selectMovie,
        selectShowtime,
        setSeats,
        completeBooking,
        resetSelection,
        getBookingById,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking(): BookingContextValue {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider')
  }
  return context
}
