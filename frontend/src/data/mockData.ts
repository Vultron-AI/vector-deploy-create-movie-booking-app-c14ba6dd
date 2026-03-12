/**
 * Mock Data for Movie Booking App
 */

import type { Movie, Theater, Showtime } from '@/types'

export const movies: Movie[] = [
  {
    id: 'movie-1',
    title: 'Galactic Odyssey',
    posterUrl: 'https://picsum.photos/seed/galactic/300/450',
    description:
      'A thrilling space adventure where a crew of explorers embarks on a dangerous mission to save humanity from an impending cosmic threat. Stunning visuals and heart-pounding action await.',
    duration: 148,
    rating: 'PG-13',
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    score: 8.5,
    releaseYear: 2026,
  },
  {
    id: 'movie-2',
    title: 'The Last Heist',
    posterUrl: 'https://picsum.photos/seed/heist/300/450',
    description:
      'A master thief assembles a team of specialists for one final job - stealing from the most secure vault in the world. But nothing is as it seems in this twisting crime thriller.',
    duration: 127,
    rating: 'R',
    genres: ['Crime', 'Thriller', 'Drama'],
    score: 7.8,
    releaseYear: 2026,
  },
  {
    id: 'movie-3',
    title: 'Whispers in the Dark',
    posterUrl: 'https://picsum.photos/seed/whispers/300/450',
    description:
      'When a family moves into a historic mansion, they discover they are not alone. Ancient secrets and supernatural forces threaten to consume them in this terrifying horror tale.',
    duration: 112,
    rating: 'R',
    genres: ['Horror', 'Mystery', 'Thriller'],
    score: 7.2,
    releaseYear: 2026,
  },
  {
    id: 'movie-4',
    title: 'Love in Paris',
    posterUrl: 'https://picsum.photos/seed/paris/300/450',
    description:
      'Two strangers meet by chance in the City of Lights and discover that sometimes the best things in life are unplanned. A heartwarming romantic comedy for all ages.',
    duration: 105,
    rating: 'PG',
    genres: ['Romance', 'Comedy'],
    score: 6.9,
    releaseYear: 2026,
  },
  {
    id: 'movie-5',
    title: 'Dragon Realm',
    posterUrl: 'https://picsum.photos/seed/dragon/300/450',
    description:
      'In a magical kingdom where dragons rule the skies, a young apprentice must harness her hidden powers to prevent a war that could destroy everything. Epic fantasy at its finest.',
    duration: 156,
    rating: 'PG-13',
    genres: ['Fantasy', 'Adventure', 'Action'],
    score: 8.1,
    releaseYear: 2026,
  },
  {
    id: 'movie-6',
    title: 'The Pixel Adventure',
    posterUrl: 'https://picsum.photos/seed/pixel/300/450',
    description:
      'When a video game character becomes self-aware, they must navigate through different game worlds to find their true purpose. A delightful animated journey for the whole family.',
    duration: 98,
    rating: 'G',
    genres: ['Animation', 'Adventure', 'Comedy'],
    score: 8.3,
    releaseYear: 2026,
  },
]

export const theaters: Theater[] = [
  {
    id: 'theater-1',
    name: 'Main Hall',
    rows: 8,
    seatsPerRow: 12,
    seatPrice: 15.0,
  },
  {
    id: 'theater-2',
    name: 'VIP Lounge',
    rows: 6,
    seatsPerRow: 8,
    seatPrice: 25.0,
  },
  {
    id: 'theater-3',
    name: 'IMAX Experience',
    rows: 10,
    seatsPerRow: 16,
    seatPrice: 22.0,
  },
]

// Generate dates for the next 7 days
function getUpcomingDates(): string[] {
  const dates: string[] = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    dates.push(date.toISOString().split('T')[0])
  }
  return dates
}

const times = ['10:30', '13:00', '15:30', '18:00', '20:30', '23:00']
const upcomingDates = getUpcomingDates()

// Generate random taken seats for a showtime
function generateTakenSeats(rows: number, seatsPerRow: number): string[] {
  const totalSeats = rows * seatsPerRow
  const numTaken = Math.floor(Math.random() * (totalSeats * 0.4)) // Up to 40% taken

  const rowLetters = 'ABCDEFGHIJ'.slice(0, rows)
  const allSeats: string[] = []

  for (const row of rowLetters) {
    for (let seat = 1; seat <= seatsPerRow; seat++) {
      allSeats.push(`${row}${seat}`)
    }
  }

  // Shuffle and pick random seats
  for (let i = allSeats.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[allSeats[i], allSeats[j]] = [allSeats[j], allSeats[i]]
  }

  return allSeats.slice(0, numTaken)
}

// Generate showtimes for all movies
export const showtimes: Showtime[] = []
let showtimeId = 1

for (const movie of movies) {
  for (const theater of theaters) {
    for (const date of upcomingDates) {
      // Not all times for all theaters
      const availableTimes = times.filter(() => Math.random() > 0.3)
      for (const time of availableTimes) {
        showtimes.push({
          id: `showtime-${showtimeId++}`,
          movieId: movie.id,
          theaterId: theater.id,
          date,
          time,
          takenSeats: generateTakenSeats(theater.rows, theater.seatsPerRow),
        })
      }
    }
  }
}

// Helper functions
export function getMovieById(id: string): Movie | undefined {
  return movies.find((m) => m.id === id)
}

export function getTheaterById(id: string): Theater | undefined {
  return theaters.find((t) => t.id === id)
}

export function getShowtimeById(id: string): Showtime | undefined {
  return showtimes.find((s) => s.id === id)
}

export function getShowtimesForMovie(movieId: string): Showtime[] {
  return showtimes.filter((s) => s.movieId === movieId)
}

export function getShowtimesByDate(
  movieId: string,
  date: string
): Showtime[] {
  return showtimes.filter((s) => s.movieId === movieId && s.date === date)
}

export function getAvailableDates(movieId: string): string[] {
  const dates = new Set(
    showtimes.filter((s) => s.movieId === movieId).map((s) => s.date)
  )
  return Array.from(dates).sort()
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}
