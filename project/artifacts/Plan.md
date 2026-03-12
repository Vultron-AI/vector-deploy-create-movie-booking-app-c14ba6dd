# Plan: Movie Booking App

Generated: 2026-02-24
Source: Project.md

## Overview
Build a movie ticket booking app that allows users to browse films, view showtimes, select seats on a visual seat map, and complete ticket purchases with confirmation. This is a frontend-only implementation using React with mock data.

## Tasks

### task-1 Define TypeScript types and mock data
**Description:** Create TypeScript interfaces for Movie, Showtime, Seat, Booking, and Theater data models. Create a mock data file with sample movies (5-6 films), showtimes, and theater configurations that will serve as the data source for the app.
**Context:** frontend/src/services/api.ts
**Creates:** frontend/src/types/index.ts, frontend/src/data/mockData.ts
**Modifies:** None
**Depends on:** None
**Verification:** TypeScript compiles without errors; mock data exports are importable

### task-2 Create Card and Input UI components
**Description:** Create reusable Card component (with header, body, footer variants) for displaying movie cards and booking summaries. Create Input component for form fields. Follow design tokens from tokens.css for styling.
**Context:** frontend/src/components/ui/Button.tsx, frontend/src/components/ui/index.ts
**Creates:** frontend/src/components/ui/Card.tsx, frontend/src/components/ui/Input.tsx
**Modifies:** frontend/src/components/ui/index.ts
**Depends on:** None
**Verification:** Components render correctly; exports are available from @/components/ui

### task-3 Create Badge and Rating UI components
**Description:** Create Badge component for displaying movie ratings (PG, PG-13, R), genres, and status indicators. Create Rating component to show star ratings or numeric scores for movies.
**Context:** frontend/src/components/ui/Button.tsx, frontend/src/components/ui/index.ts
**Creates:** frontend/src/components/ui/Badge.tsx, frontend/src/components/ui/Rating.tsx
**Modifies:** frontend/src/components/ui/index.ts
**Depends on:** None
**Verification:** Badge renders with different variants; Rating displays correctly

### task-4 Create MovieCard and MovieList components
**Description:** Create MovieCard component to display a single movie with poster, title, rating, duration, and genre badges. Create MovieList component to display a grid of MovieCards. Include hover states and click handlers for navigation.
**Context:** frontend/src/components/ui/Card.tsx, frontend/src/types/index.ts, frontend/src/data/mockData.ts
**Creates:** frontend/src/components/movies/MovieCard.tsx, frontend/src/components/movies/MovieList.tsx, frontend/src/components/movies/index.ts
**Modifies:** None
**Depends on:** task-1, task-2, task-3
**Verification:** Movie grid renders with mock data; cards are clickable

### task-5 Create MovieDetail and ShowtimeSelector components
**Description:** Create MovieDetail component showing full movie information (poster, description, duration, rating, genres). Create ShowtimeSelector component to display available dates and times, allowing users to select a showtime. Include date tabs and time slot buttons.
**Context:** frontend/src/types/index.ts, frontend/src/data/mockData.ts
**Creates:** frontend/src/components/movies/MovieDetail.tsx, frontend/src/components/showtimes/ShowtimeSelector.tsx, frontend/src/components/showtimes/index.ts
**Modifies:** frontend/src/components/movies/index.ts
**Depends on:** task-1, task-2, task-3
**Verification:** Movie details display correctly; showtimes are selectable by date

### task-6 Create SeatMap and SeatSelector components
**Description:** Create SeatMap component that renders a visual grid of theater seats with screen indicator. Create SeatSelector wrapper that manages seat selection state, shows legend (available/selected/taken), displays selected seat count and total price. Seats should be clickable to toggle selection.
**Context:** frontend/src/types/index.ts, frontend/src/data/mockData.ts
**Creates:** frontend/src/components/seats/SeatMap.tsx, frontend/src/components/seats/SeatSelector.tsx, frontend/src/components/seats/index.ts
**Modifies:** None
**Depends on:** task-1
**Verification:** Seat map renders correctly; seats can be selected/deselected; taken seats are not selectable

### task-7 Create BookingSummary and CheckoutForm components
**Description:** Create BookingSummary component showing selected movie, showtime, seats, and total price. Create CheckoutForm component with payment fields (card number, expiry, CVV) - mock validation only, no real payment processing. Include a confirm booking button.
**Context:** frontend/src/components/ui/Input.tsx, frontend/src/components/ui/Card.tsx, frontend/src/types/index.ts
**Creates:** frontend/src/components/booking/BookingSummary.tsx, frontend/src/components/booking/CheckoutForm.tsx, frontend/src/components/booking/index.ts
**Modifies:** None
**Depends on:** task-1, task-2
**Verification:** Summary displays all booking details; form validates input fields

### task-8 Create BookingConfirmation component with ticket display
**Description:** Create BookingConfirmation component showing successful booking details including movie, showtime, seats, and a mock QR code/ticket representation. Include a "View My Bookings" link and option to book another movie.
**Context:** frontend/src/types/index.ts, frontend/src/components/ui/Card.tsx
**Creates:** frontend/src/components/booking/BookingConfirmation.tsx
**Modifies:** frontend/src/components/booking/index.ts
**Depends on:** task-1, task-2, task-7
**Verification:** Confirmation displays all ticket details; QR code placeholder renders

### task-9 Create booking state management with React Context
**Description:** Create BookingContext to manage the booking flow state: selected movie, showtime, seats, and completed bookings. Provide actions for selecting/deselecting items and completing bookings. Store completed bookings in localStorage for persistence.
**Context:** frontend/src/types/index.ts
**Creates:** frontend/src/context/BookingContext.tsx, frontend/src/context/index.ts
**Modifies:** None
**Depends on:** task-1
**Verification:** Context provides state and actions; bookings persist across page refreshes

### task-10 Create page components and routing
**Description:** Create page components: HomePage (movie list), MoviePage (details + showtime selection), SeatSelectionPage, CheckoutPage, ConfirmationPage, and MyBookingsPage. Set up React Router with routes for each page. Add navigation header with app title and "My Bookings" link.
**Context:** frontend/src/App.tsx, frontend/src/components/movies/index.ts, frontend/src/components/seats/index.ts, frontend/src/components/booking/index.ts
**Creates:** frontend/src/pages/HomePage.tsx, frontend/src/pages/MoviePage.tsx, frontend/src/pages/SeatSelectionPage.tsx, frontend/src/pages/CheckoutPage.tsx, frontend/src/pages/ConfirmationPage.tsx, frontend/src/pages/MyBookingsPage.tsx, frontend/src/pages/index.ts, frontend/src/components/layout/Header.tsx, frontend/src/components/layout/index.ts
**Modifies:** frontend/src/App.tsx
**Depends on:** task-4, task-5, task-6, task-7, task-8, task-9
**Verification:** All routes navigate correctly; booking flow works end-to-end

### task-11 Add loading and empty states
**Description:** Create EmptyState component for when no movies or bookings exist. Add loading states with Spinner to pages during data fetching. Add error boundaries for graceful error handling.
**Context:** frontend/src/components/ui/Spinner.tsx, frontend/src/pages/HomePage.tsx, frontend/src/pages/MyBookingsPage.tsx
**Creates:** frontend/src/components/ui/EmptyState.tsx
**Modifies:** frontend/src/components/ui/index.ts, frontend/src/pages/HomePage.tsx, frontend/src/pages/MyBookingsPage.tsx
**Depends on:** task-10
**Verification:** Empty states display when no data; loading spinners show during fetches

### task-12 Write Playwright E2E tests for movie booking flow
**Description:** Update E2E tests to cover the main booking flow: browse movies, select a movie, choose showtime, select seats, complete checkout, view confirmation. Add tests for the My Bookings page. Use semantic data-testid selectors.
**Context:** frontend/tests/e2e/app.spec.ts
**Creates:** frontend/tests/e2e/booking-flow.spec.ts
**Modifies:** frontend/tests/e2e/app.spec.ts
**Depends on:** task-10, task-11
**Verification:** All E2E tests pass; screenshots capture key pages

## Summary
- Total tasks: 12
- Files created: 28
- Files modified: 6
- Estimated complexity: medium
