import { expect, test } from '@playwright/test'

/* Needs a Supabase backend with the secret key (CI local stack, E2E_SUPABASE=1). */
test.skip(!process.env.E2E_SUPABASE, 'requires a Supabase backend (E2E_SUPABASE=1)')

test('supprimer son compte efface tout, après une confirmation tapée', async ({ page }) => {
  await page.goto('/home')
  await page.getByRole('button', { name: 'J’aimerais…' }).click()
  await page.getByRole('textbox', { name: 'Ton envie' }).fill('Une envie à effacer')
  await page.getByRole('button', { name: 'Garder' }).click()
  await expect(page.getByRole('textbox', { name: 'Ton envie' })).toBeHidden()

  await page.goto('/me')
  await expect(
    page.getByText('L’export sera disponible une fois ton carnet relié à ton adresse.'),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Supprimer mon compte' }).click()
  const confirm = page.getByRole('button', { name: 'Supprimer définitivement' })
  await expect(confirm).toBeDisabled()
  await page.getByLabel(/Pour confirmer/).fill('supprimer')
  await confirm.click()
  await expect(page.getByText('Ton compte et toutes tes données ont été supprimés.')).toBeVisible()

  await page.goto('/goals')
  await expect(page.getByRole('heading', { name: 'Ton carnet est prêt.' })).toBeVisible()
})
