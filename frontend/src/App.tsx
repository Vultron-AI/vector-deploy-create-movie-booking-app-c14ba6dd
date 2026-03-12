/**
 * Main App Component
 *
 * Movie booking application with routing and providers.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DialogProvider } from '@/components/ui'
import { BookingProvider } from '@/context'
import { Header } from '@/components/layout'
import {
  HomePage,
  MoviePage,
  SeatSelectionPage,
  CheckoutPage,
  ConfirmationPage,
  MyBookingsPage,
} from '@/pages'

function App() {
  return (
    <BrowserRouter>
      <DialogProvider>
        <BookingProvider>
          <div className="min-h-screen bg-[var(--color-bg)]">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/movie/:movieId" element={<MoviePage />} />
                <Route path="/seats/:showtimeId" element={<SeatSelectionPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/confirmation/:bookingId" element={<ConfirmationPage />} />
                <Route path="/my-bookings" element={<MyBookingsPage />} />
              </Routes>
            </main>
          </div>
        </BookingProvider>
      </DialogProvider>
    </BrowserRouter>
  )
}

export default App
