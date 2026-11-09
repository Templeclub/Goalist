import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

async function expectAccessible(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  expect(results.violations).toEqual([])
}

test.describe('Premiers pas (sans compte)', () => {
  test('de la page publique au carnet, en passant par l’onboarding', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Commencer mon carnet' }).click()
    await expect(page.getByRole('heading', { name: 'Un carnet pour tes envies' })).toBeVisible()
    await page.getByRole('button', { name: 'Continuer' }).click()
    await page.getByRole('button', { name: 'Continuer' }).click()
    await page.getByRole('button', { name: 'Écrire ma première envie' }).click()
    await expect(page).toHaveURL(/\/home$/)
    await expect(page.getByRole('heading', { name: 'Ton deck est prêt.' })).toBeVisible()
  })

  test('la capture s’ouvre avec « + » et avec la touche N', async ({ page, isMobile }) => {
    await page.goto('/home')
    await expect(page.getByRole('heading', { name: 'Ton deck est prêt.' })).toBeVisible()
    if (isMobile) {
      await page
        .getByRole('navigation', { name: 'Navigation principale' })
        .getByRole('button', { name: 'Nouvelle carte' })
        .click()
    } else {
      // Shortcuts listen once the page is hydrated.
      await page.waitForLoadState('networkidle')
      await page.keyboard.press('n')
    }
    const field = page.getByRole('textbox', { name: 'Ton envie' })
    await expect(field).toBeFocused()
    await expect(page.getByRole('button', { name: 'Garder' })).toBeDisabled()
    await page.getByRole('button', { name: /Apprendre à faire son pain/ }).click()
    await expect(field).toHaveValue('Apprendre à faire son pain')
    await expect(page.getByText(/15 ans ou plus/)).toBeVisible()
    await expectAccessible(page)
    await page.keyboard.press('Escape')
    await expect(field).toBeHidden()
  })

  test('un exemple de l’état vide préremplit la capture', async ({ page }) => {
    await page.goto('/home')
    await page.getByRole('button', { name: 'Essayer : Écrire à une vieille amie' }).click()
    await expect(page.getByRole('textbox', { name: 'Ton envie' })).toHaveValue(
      'Écrire à une vieille amie',
    )
  })

  test('la connexion guide sans brusquer', async ({ page }) => {
    await page.goto('/sign-in')
    await page.getByLabel('Ton adresse e-mail').fill('camille@')
    await page.getByRole('button', { name: 'Recevoir le lien' }).click()
    await expect(
      page.getByRole('alert').filter({ hasText: 'Cette adresse ne semble pas complète.' }),
    ).toBeVisible()
  })

  test('un compte Google qui a déjà son carnet est expliqué', async ({ page }) => {
    await page.goto('/sign-in?error=googleTaken')
    await expect(
      page.getByRole('alert').filter({ hasText: 'Ce compte Google a déjà son carnet.' }),
    ).toBeVisible()
  })

  test('un lien expiré est expliqué', async ({ page }) => {
    await page.goto('/sign-in?error=callback')
    await expect(
      page.getByRole('alert').filter({ hasText: 'La connexion n’a pas abouti.' }),
    ).toBeVisible()
  })

  test('une envie inconnue ne révèle rien', async ({ page }) => {
    await page.goto('/goals/0192f3a4-7b1c-7d2e-8f3a-123456789abc')
    await expect(
      page.getByRole('heading', { name: 'Cette envie n’est pas dans ton carnet.' }),
    ).toBeVisible()
  })

  for (const path of [
    '/welcome',
    '/home',
    '/goals',
    '/collection',
    '/friends',
    '/me',
    '/sign-in',
    '/privacy',
  ]) {
    for (const colorScheme of ['light', 'dark'] as const) {
      test(`${path} respecte WCAG 2.2 AA (${colorScheme === 'light' ? 'clair' : 'sombre'})`, async ({
        page,
      }) => {
        await page.emulateMedia({ colorScheme })
        await page.goto(path)
        await page.waitForLoadState('networkidle')
        await expectAccessible(page)
      })
    }
  }
})
