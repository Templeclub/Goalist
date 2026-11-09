import { expect, test } from '@playwright/test'

/* Needs a Supabase backend (CI local stack, E2E_SUPABASE=1). */
test.skip(!process.env.E2E_SUPABASE, 'requires a Supabase backend (E2E_SUPABASE=1)')

test.describe('Collection (avec Supabase)', () => {
  test('suivre une carte, la convertir, la retrouver numérotée, puis la remettre en cours', async ({
    page,
  }) => {
    await page.goto('/home')
    await page.getByRole('button', { name: 'J’aimerais…' }).click()
    await page.getByRole('textbox', { name: 'Ton envie' }).fill('Courir 5 km d’affilée')
    await page.getByRole('button', { name: 'Garder' }).click()
    await page.getByRole('button', { name: 'Oui' }).click()
    await expect(
      page.getByRole('heading', { level: 1, name: 'Courir 5 km d’affilée' }),
    ).toBeVisible()

    // Follow the card along its path: converting only comes at the last step.
    await expect(page.getByRole('button', { name: /convertir la carte/ })).toBeHidden()
    await page.getByRole('button', { name: 'Avancer : Confirmée →' }).click()
    await page.getByRole('button', { name: 'Passer à l’étape : En cours' }).click()
    await expect(page.getByText('Étape 4 sur 5')).toBeVisible()
    await page.getByRole('button', { name: 'C’est fait : convertir la carte ★' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Carte acquise !' })).toBeVisible()

    await page.getByRole('link', { name: 'Voir ma collection' }).click()
    await expect(page).toHaveURL(/\/collection$/)
    const binder = page.locator('main').filter({ visible: true })
    await expect(binder.getByText('1 carte acquise')).toBeVisible()
    const card = binder.getByRole('article').filter({ hasText: 'Courir 5 km d’affilée' })
    await expect(card).toHaveAttribute('data-state', 'acquired')
    await expect(card.getByText('★ n° 001')).toBeVisible()

    // An acquired card leaves the deck, and can go back to it.
    await card.getByRole('link', { name: 'Courir 5 km d’affilée' }).click()
    await page.getByRole('button', { name: 'Remettre en cours' }).click()
    await expect(page.getByText('Étape 4 sur 5')).toBeVisible()
    await page.goto('/collection')
    await expect(page.getByText('Aucune carte acquise pour l’instant')).toBeVisible()
  })
})
