import { expect, test } from '@playwright/test'

/*
 * Needs a Supabase backend with the migrations applied and anonymous sign-ins
 * enabled. CI runs it against the local stack (E2E_SUPABASE=1).
 */
test.skip(!process.env.E2E_SUPABASE, 'requires a Supabase backend (E2E_SUPABASE=1)')

test.describe('Capture et sauvegarde (avec Supabase)', () => {
  test('garder une envie en moins de 10 secondes, sans compte', async ({ page }) => {
    await page.goto('/home')
    await expect(page.getByRole('heading', { name: 'Ton deck est prêt.' })).toBeVisible()

    const started = Date.now()
    await page.getByRole('button', { name: 'J’aimerais…' }).click()
    await page.getByRole('textbox', { name: 'Ton envie' }).fill('Dormir une nuit à la belle étoile')
    await page.getByRole('button', { name: 'Garder' }).click()
    await expect(
      page.getByRole('status').filter({ hasText: 'Ta première envie est écrite.' }),
    ).toBeVisible()
    expect(Date.now() - started).toBeLessThan(10_000)

    await expect(
      page.getByRole('link', { name: 'Dormir une nuit à la belle étoile' }),
    ).toBeVisible()
    await expect(page.getByText('Ton carnet n’est gardé que sur cet appareil.')).toBeVisible()
  })

  test('l’emoji est deviné, puis modifiable sans jamais rien perdre', async ({ page }) => {
    await page.goto('/home')
    await page.getByRole('button', { name: 'J’aimerais…' }).click()
    await page.getByRole('textbox', { name: 'Ton envie' }).fill('Apprendre le violoncelle')
    await page.getByRole('button', { name: 'Garder' }).click()
    await page.getByRole('button', { name: 'Oui' }).click()
    await expect(page.getByRole('link', { name: 'Compléter la fiche' })).toBeVisible()
    await page.goto(`${page.url()}/edit/name`)
    await expect(page).toHaveURL(/\/edit\/name$/)

    // Emoji guessed from the title, editable and saved as you type.
    const emoji = page.getByLabel(/^Emoji/)
    await expect(emoji).toHaveValue('🎸')
    // Wait for the autosave request itself, registered before typing.
    const saved = page.waitForResponse(
      (r) => r.url().includes('/api/goals/') && r.request().method() === 'PATCH' && r.ok(),
    )
    await emoji.fill('🎻')
    await saved

    await page.reload()
    await expect(page.getByLabel(/^Emoji/)).toHaveValue('🎻')
  })

  test('une seconde envie ne refait pas le message de la première', async ({ page }) => {
    await page.goto('/home')
    for (const title of ['Écrire à une vieille amie', 'Apprendre à faire son pain']) {
      await page.getByRole('button', { name: 'J’aimerais…' }).click()
      await page.getByRole('textbox', { name: 'Ton envie' }).fill(title)
      await page.getByRole('button', { name: 'Garder' }).click()
      await expect(page.getByRole('textbox', { name: 'Ton envie' })).toBeHidden()
    }
    await expect(page.getByRole('status').filter({ hasText: 'Envie gardée.' })).toBeVisible()
    await page.goto('/goals')
    await expect(page.getByText('2 cartes à convertir')).toBeVisible()
  })
})
