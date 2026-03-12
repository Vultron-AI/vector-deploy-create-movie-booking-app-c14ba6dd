/**
 * E2E Tests - Movie Booking App
 *
 * These tests capture screenshots for visual validation.
 */

import { test, expect } from '@playwright/test'
import { mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// DO NOT CHANGE THESE NAMES
const MAIN_PAGE_SCREENSHOT_NAME = 'MainPage'
const LANDING_PAGE_SCREENSHOT_NAME = 'LandingPage'

// Ensure screenshots directory exists (ESM-compatible)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const screenshotsDir = join(__dirname, '..', 'screenshots')
if (!existsSync(screenshotsDir)) {
  mkdirSync(screenshotsDir, { recursive: true })
}

test.describe('App E2E Tests', () => {
  /**
   * Capture landing page screenshot - Shows the movie list
   */
  test('captures LandingPage screenshot', async ({ page }) => {
    await page.goto('/')

    await page.waitForLoadState('networkidle')

    // Wait for movies to load
    await page.waitForSelector('[data-testid="home-page"]', { timeout: 5000 })
    await page.waitForSelector('[data-testid="movie-list"]', { timeout: 5000 })

    await page.screenshot({
      path: join(screenshotsDir, LANDING_PAGE_SCREENSHOT_NAME + '.png'),
      fullPage: true,
    })

    await expect(page.getByTestId('home-page')).toBeVisible()
    await expect(page.getByTestId('movie-list')).toBeVisible()
  })

  /**
   * Capture main page screenshot - Shows the movie list with navigation
   */
  test('captures MainPage screenshot', async ({ page }) => {
    await page.goto('/')

    await page.waitForLoadState('networkidle')

    // Wait for the page to fully load
    await page.waitForSelector('[data-testid="home-page"]', { timeout: 5000 })

    await page.screenshot({
      path: join(screenshotsDir, MAIN_PAGE_SCREENSHOT_NAME + '.png'),
      fullPage: true,
    })

    // Verify main elements
    await expect(page.getByTestId('my-bookings-link')).toBeVisible()
    await expect(page.getByText('Now Showing')).toBeVisible()
  })

  /**
   * Test navigation to My Bookings page
   */
  test('navigates to My Bookings page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.getByTestId('my-bookings-link').click()
    await page.waitForURL('/my-bookings')

    await expect(page.getByTestId('my-bookings-page')).toBeVisible()
    await expect(page.getByText('My Bookings')).toBeVisible()
  })

  /**
   * Test clicking a movie card navigates to movie details
   */
  test('clicking movie card shows movie details', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('[data-testid="movie-list"]', { timeout: 5000 })

    // Click the first movie card
    await page.getByTestId('movie-card-movie-1').click()

    // Wait for navigation
    await page.waitForURL(/\/movie\/movie-1/)

    // Verify movie detail page
    await expect(page.getByTestId('movie-page')).toBeVisible()
    await expect(page.getByTestId('movie-detail')).toBeVisible()
    await expect(page.getByTestId('showtime-selector')).toBeVisible()
  })
})
