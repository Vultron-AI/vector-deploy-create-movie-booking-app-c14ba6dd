/**
 * E2E Tests - Movie Booking Flow
 *
 * Tests the complete booking flow from browsing to confirmation.
 */

import { test, expect } from '@playwright/test'
import { mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Ensure screenshots directory exists
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const screenshotsDir = join(__dirname, '..', 'screenshots')
if (!existsSync(screenshotsDir)) {
  mkdirSync(screenshotsDir, { recursive: true })
}

test.describe('Booking Flow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  /**
   * Test complete booking flow
   */
  test('completes full booking flow', async ({ page }) => {
    // Step 1: Browse movies
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('[data-testid="movie-list"]', { timeout: 5000 })

    await page.screenshot({
      path: join(screenshotsDir, 'booking-1-movie-list.png'),
      fullPage: true,
    })

    // Step 2: Select a movie
    await page.getByTestId('movie-card-movie-1').click()
    await page.waitForURL(/\/movie\/movie-1/)
    await expect(page.getByTestId('movie-detail')).toBeVisible()

    await page.screenshot({
      path: join(screenshotsDir, 'booking-2-movie-details.png'),
      fullPage: true,
    })

    // Step 3: Select a showtime (click first available showtime button)
    await page.waitForSelector('[data-testid="showtime-selector"]')
    const showtimeButtons = page.locator('[data-testid^="showtime-"]')
    await showtimeButtons.first().click()

    // Wait for navigation to seat selection
    await page.waitForURL(/\/seats\//)
    await expect(page.getByTestId('seat-selection-page')).toBeVisible()

    await page.screenshot({
      path: join(screenshotsDir, 'booking-3-seat-selection.png'),
      fullPage: true,
    })

    // Step 4: Select seats (click first two available seats)
    const availableSeats = page.locator('[data-testid^="seat-"]:not([disabled])')
    await availableSeats.nth(0).click()
    await availableSeats.nth(1).click()

    await page.screenshot({
      path: join(screenshotsDir, 'booking-4-seats-selected.png'),
      fullPage: true,
    })

    // Step 5: Continue to checkout
    await page.getByTestId('continue-to-checkout').click()
    await page.waitForURL('/checkout')
    await expect(page.getByTestId('checkout-page')).toBeVisible()

    await page.screenshot({
      path: join(screenshotsDir, 'booking-5-checkout.png'),
      fullPage: true,
    })

    // Step 6: Fill checkout form
    await page.getByTestId('email-input').fill('test@example.com')
    await page.getByTestId('card-name-input').fill('John Doe')
    await page.getByTestId('card-number-input').fill('4111111111111111')
    await page.getByTestId('expiry-input').fill('1225')
    await page.getByTestId('cvv-input').fill('123')

    await page.screenshot({
      path: join(screenshotsDir, 'booking-6-form-filled.png'),
      fullPage: true,
    })

    // Step 7: Submit booking
    await page.getByTestId('confirm-booking-btn').click()

    // Wait for confirmation page
    await page.waitForURL(/\/confirmation\//)
    await expect(page.getByTestId('booking-confirmation')).toBeVisible()

    await page.screenshot({
      path: join(screenshotsDir, 'booking-7-confirmation.png'),
      fullPage: true,
    })

    // Verify confirmation elements
    await expect(page.getByText('Booking Confirmed!')).toBeVisible()
    await expect(page.getByTestId('view-bookings-btn')).toBeVisible()
    await expect(page.getByTestId('book-another-btn')).toBeVisible()
  })

  /**
   * Test viewing bookings after completing a booking
   */
  test('displays booking in My Bookings page', async ({ page }) => {
    // Complete a booking first (abbreviated flow)
    await page.goto('/')
    await page.waitForSelector('[data-testid="movie-list"]', { timeout: 5000 })

    // Quick booking flow
    await page.getByTestId('movie-card-movie-1').click()
    await page.waitForURL(/\/movie\/movie-1/)

    const showtimeButtons = page.locator('[data-testid^="showtime-"]')
    await showtimeButtons.first().click()
    await page.waitForURL(/\/seats\//)

    const availableSeats = page.locator('[data-testid^="seat-"]:not([disabled])')
    await availableSeats.nth(0).click()

    await page.getByTestId('continue-to-checkout').click()
    await page.waitForURL('/checkout')

    await page.getByTestId('email-input').fill('test@example.com')
    await page.getByTestId('card-name-input').fill('Jane Doe')
    await page.getByTestId('card-number-input').fill('4111111111111111')
    await page.getByTestId('expiry-input').fill('1225')
    await page.getByTestId('cvv-input').fill('123')

    await page.getByTestId('confirm-booking-btn').click()
    await page.waitForURL(/\/confirmation\//)

    // Navigate to My Bookings
    await page.getByTestId('view-bookings-btn').click()
    await page.waitForURL('/my-bookings')

    await expect(page.getByTestId('my-bookings-page')).toBeVisible()

    // Verify booking is displayed
    const bookingCards = page.locator('[data-testid^="booking-"]')
    await expect(bookingCards).toHaveCount(1)

    await page.screenshot({
      path: join(screenshotsDir, 'booking-8-my-bookings.png'),
      fullPage: true,
    })
  })

  /**
   * Test empty My Bookings page
   */
  test('shows empty state when no bookings', async ({ page }) => {
    await page.goto('/my-bookings')
    await page.waitForLoadState('networkidle')

    await expect(page.getByTestId('my-bookings-page')).toBeVisible()
    await expect(page.getByTestId('empty-state')).toBeVisible()
    await expect(page.getByText('No Bookings Yet')).toBeVisible()
    await expect(page.getByTestId('browse-movies-btn')).toBeVisible()

    await page.screenshot({
      path: join(screenshotsDir, 'my-bookings-empty.png'),
      fullPage: true,
    })
  })

  /**
   * Test seat selection limits
   */
  test('cannot select taken seats', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="movie-list"]', { timeout: 5000 })

    await page.getByTestId('movie-card-movie-1').click()
    await page.waitForURL(/\/movie\/movie-1/)

    const showtimeButtons = page.locator('[data-testid^="showtime-"]')
    await showtimeButtons.first().click()
    await page.waitForURL(/\/seats\//)

    // Verify taken seats are disabled
    const takenSeats = page.locator('[data-testid^="seat-"][disabled]')
    const takenCount = await takenSeats.count()

    // There should be some taken seats in the mock data
    expect(takenCount).toBeGreaterThan(0)
  })
})
