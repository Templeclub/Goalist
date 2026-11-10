import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.describe('Page publique', () => {
  test('affiche la promesse du carnet en français', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Boosteur/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Ce que tu aimerais vraiment, enfin écrit.',
    )
    await expect(page.getByText('Voyage & aventure')).toBeVisible()
  })

  test('ne défile jamais horizontalement', async ({ page }) => {
    await page.goto('/')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`respecte WCAG 2.2 AA en thème ${colorScheme === 'light' ? 'clair' : 'sombre'}`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme })
      await page.goto('/')
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze()
      expect(results.violations).toEqual([])
    })
  }

  test('envoie les en-têtes de sécurité', async ({ request }) => {
    const response = await request.get('/')
    const headers = response.headers()
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'")
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
  })

  test('expose un manifeste PWA installable', async ({ request }) => {
    const response = await request.get('/manifest.webmanifest')
    expect(response.ok()).toBe(true)
    const manifest = await response.json()
    expect(manifest.display).toBe('standalone')
    expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true)
  })
})
