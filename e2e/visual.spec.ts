import { expect, test } from '@playwright/test'

/*
 * Visual regression: mobile and desktop, light and dark.
 * Baselines are generated in CI's Playwright Docker image (fonts are self-hosted,
 * animations disabled) to stay stable: `pnpm e2e:visual --update-snapshots`.
 */
const viewports = { mobile: { width: 390, height: 844 }, desktop: { width: 1280, height: 800 } }

for (const [device, viewport] of Object.entries(viewports)) {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`page publique · ${device} · ${colorScheme}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' })
      await page.goto('/')
      await page.evaluate(() => document.fonts.ready)
      await expect(page).toHaveScreenshot(`landing-${device}-${colorScheme}.png`, {
        fullPage: true,
      })
    })
  }
}
