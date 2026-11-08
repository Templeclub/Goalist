import { expect, test, type Page } from '@playwright/test'

/* Needs a Supabase backend (CI local stack, E2E_SUPABASE=1). */
test.skip(!process.env.E2E_SUPABASE, 'requires a Supabase backend (E2E_SUPABASE=1)')

async function keep(page: Page, title: string) {
  await page.getByRole('button', { name: 'J’aimerais…' }).click()
  await page.getByRole('textbox', { name: 'Ton envie' }).fill(title)
  await page.getByRole('button', { name: 'Garder' }).click()
  await expect(page.getByRole('textbox', { name: 'Ton envie' })).toBeHidden()
}

const list = (page: Page) => page.locator('main').filter({ visible: true })

test.describe('Consulter & retrouver (avec Supabase)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/home')
    await keep(page, 'Dormir une nuit à la belle étoile')
    await keep(page, 'Apprendre à faire son pain')
    await keep(page, 'Écrire à une vieille amie')
  })

  test('chercher sans accents, puis effacer', async ({ page }) => {
    await page.goto('/goals')
    await page.getByRole('searchbox', { name: 'Rechercher dans mes envies' }).fill('etoile')
    await expect(page).toHaveURL(/q=etoile/)
    await expect(
      list(page).getByRole('link', { name: 'Dormir une nuit à la belle étoile' }),
    ).toBeVisible()
    await expect(list(page).getByRole('link', { name: 'Apprendre à faire son pain' })).toBeHidden()
    await page.getByRole('button', { name: 'Effacer la recherche' }).click()
    await expect(list(page).getByRole('link', { name: 'Apprendre à faire son pain' })).toBeVisible()
  })

  test('« À compléter », puis ne plus proposer une envie', async ({ page }) => {
    await page.goto('/goals')
    await page.getByRole('button', { name: 'À compléter', pressed: false }).click()
    await expect(page).toHaveURL(/quick=to_complete/)
    await expect(page.getByText('3 envies')).toBeVisible()
    await page
      .getByRole('button', { name: 'Ne plus me le proposer : Écrire à une vieille amie' })
      .click()
    await expect(page.getByText('2 envies')).toBeVisible()
    await page.getByRole('button', { name: 'À compléter', pressed: true }).click()
    await expect(page.getByText('3 envies')).toBeVisible()
  })

  test('filtrer par statut dans la feuille de filtres', async ({ page }) => {
    await page.goto('/goals')
    await page.getByRole('button', { name: 'Filtres' }).click()
    await page.getByText('Réalisé', { exact: true }).click()
    await expect(page).toHaveURL(/status=done/)
    // The page behind a modal sheet is hidden from assistive technologies: close it first.
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: 'Filtres (1)' })).toBeVisible()
    await expect(page.getByText('Rien ne correspond à ces filtres.')).toBeVisible()
  })

  test('sur ordinateur, la page de l’envie s’ouvre à droite', async ({ page, isMobile }) => {
    test.skip(isMobile, 'master-detail is a desktop layout')
    await page.goto('/home')
    // Shortcuts listen once the page is hydrated.
    await page.waitForLoadState('networkidle')
    await page.keyboard.press('/')
    await expect(page).toHaveURL(/\/goals/)
    await expect(page.getByRole('searchbox', { name: 'Rechercher dans mes envies' })).toBeFocused()
    await list(page).getByRole('link', { name: 'Apprendre à faire son pain' }).click()
    await expect(page).toHaveURL(/open=/)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Apprendre à faire son pain' }),
    ).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: 'Mes envies' })).toBeVisible()
  })
})
