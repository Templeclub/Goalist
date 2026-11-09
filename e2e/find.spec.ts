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
    await page.getByRole('searchbox', { name: 'Rechercher dans mes cartes' }).fill('etoile')
    await expect(page).toHaveURL(/q=etoile/)
    await expect(
      list(page).getByRole('link', { name: 'Dormir une nuit à la belle étoile' }),
    ).toBeVisible()
    await expect(list(page).getByRole('link', { name: 'Apprendre à faire son pain' })).toBeHidden()
    await page.getByRole('button', { name: 'Effacer la recherche' }).click()
    await expect(list(page).getByRole('link', { name: 'Apprendre à faire son pain' })).toBeVisible()
  })

  test('« À révéler », puis ne plus proposer une carte', async ({ page }) => {
    await page.goto('/goals')
    await page.getByRole('button', { name: 'À révéler', pressed: false }).click()
    await expect(page).toHaveURL(/quick=to_complete/)
    await expect(page.getByText('3 cartes à convertir')).toBeVisible()
    await page
      .getByRole('button', { name: 'Ne plus me le proposer : Écrire à une vieille amie' })
      .click()
    await expect(page.getByText('2 cartes à convertir')).toBeVisible()
    await page.getByRole('button', { name: 'À révéler', pressed: true }).click()
    await expect(page.getByText('3 cartes à convertir')).toBeVisible()
  })

  test('filtrer par statut dans la feuille de filtres', async ({ page }) => {
    await page.goto('/goals')
    await page.getByRole('button', { name: 'Filtres' }).click()
    await page.getByText('Acquise', { exact: true }).click()
    await expect(page).toHaveURL(/status=done/)
    // The page behind a modal sheet is hidden from assistive technologies: close it first.
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: 'Filtres (1)' })).toBeVisible()
    await expect(page.getByText('Rien ne correspond à ces filtres.')).toBeVisible()
  })

  test('des cartes en grille, avec la catégorie devinée et regroupées par horizon', async ({
    page,
  }) => {
    await page.goto('/home')
    // Shortcuts listen once the page is hydrated.
    await page.waitForLoadState('networkidle')
    await page.keyboard.press('/')
    await expect(page).toHaveURL(/\/goals/)
    await expect(page.getByRole('searchbox', { name: 'Rechercher dans mes cartes' })).toBeFocused()
    await expect(
      list(page).getByRole('heading', { level: 2, name: /Horizon non précisé · 3/ }),
    ).toBeVisible()
    const card = list(page)
      .getByRole('article')
      .filter({ hasText: 'Dormir une nuit à la belle étoile' })
    await expect(card.getByText('Voyage & aventure')).toBeVisible()
    // Two cards side by side, even on a phone.
    const boxes = await list(page)
      .getByRole('article')
      .evaluateAll((els) => els.slice(0, 2).map((el) => el.getBoundingClientRect().top))
    expect(boxes[0]).toBe(boxes[1])
    await list(page).getByRole('link', { name: 'Apprendre à faire son pain' }).click()
    await expect(
      page.getByRole('heading', { level: 1, name: 'Apprendre à faire son pain' }),
    ).toBeVisible()
  })
})
