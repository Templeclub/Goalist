import { expect, test } from '@playwright/test'

test.describe('Hors ligne minimal', () => {
  test('une page déjà ouverte reste lisible, sinon une page de secours calme', async ({
    page,
    context,
  }) => {
    await page.goto('/home')
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => navigator.serviceWorker.ready)
    await page.reload({ waitUntil: 'networkidle' })
    expect(await page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)

    await context.setOffline(true)
    await page.reload()
    await expect(page.getByText('Hors ligne. Tu peux continuer d’écrire.')).toBeVisible()

    await page.goto('/privacy').catch(() => {})
    await expect(
      page.getByRole('heading', { name: 'Pas de connexion pour l’instant' }),
    ).toBeVisible()
    await context.setOffline(false)
  })
})
