import { test, expect } from '@playwright/test'

test('visits the admin dashboard shell from the app root url', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('h1')).toHaveText('Dashboard')
  await expect(page.getByRole('navigation', { name: 'System administrator navigation' })).toBeVisible()
  await expect(page.getByText('No notification contract is approved yet.')).toBeVisible()
})

test('opens mobile navigation drawer without hiding dashboard content', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  await page.getByRole('button', { name: 'Open navigation' }).click()

  await expect(page.getByRole('navigation', { name: 'System administrator navigation' })).toBeVisible()
  await expect(page.locator('h1')).toHaveText('Dashboard')
})
