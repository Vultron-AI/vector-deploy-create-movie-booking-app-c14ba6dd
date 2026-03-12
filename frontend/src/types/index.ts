/**
 * Movie Booking App Types
 */

export interface Movie {
  id: string
  title: string
  posterUrl: string
  description: string
  duration: number // in minutes
  rating: MovieRating
  genres: Genre[]
  score: number // 0-10
  releaseYear: number
}

export type MovieRating = 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17'

export type Genre =
  | 'Action'
  | 'Adventure'
  | 'Animation'
  | 'Comedy'
  | 'Crime'
  | 'Drama'
  | 'Fantasy'
  | 'Horror'
  | 'Mystery'
  | 'Romance'
  | 'Sci-Fi'
  | 'Thriller'

export interface Theater {
  id: string
  name: string
  rows: number
  seatsPerRow: number
  seatPrice: number
}

export interface Showtime {
  id: string
  movieId: string
  theaterId: string
  date: string // ISO date string YYYY-MM-DD
  time: string // HH:mm format
  takenSeats: string[] // array of seat IDs like "A1", "B5"
}

export type SeatStatus = 'available' | 'selected' | 'taken'

export interface Seat {
  id: string // e.g., "A1", "B5"
  row: string
  number: number
  status: SeatStatus
}

export interface Booking {
  id: string
  movieId: string
  showtimeId: string
  theaterId: string
  seats: string[] // array of seat IDs
  totalPrice: number
  customerName: string
  customerEmail: string
  createdAt: string // ISO timestamp
}

export interface BookingState {
  selectedMovie: Movie | null
  selectedShowtime: Showtime | null
  selectedSeats: string[]
  completedBookings: Booking[]
}
