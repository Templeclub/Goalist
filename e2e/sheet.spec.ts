import { expect, test, type Page } from '@playwright/test'

/* Needs a Supabase backend (CI local stack, E2E_SUPABASE=1). */
test.skip(!process.env.E2E_SUPABASE, 'requires a Supabase backend (E2E_SUPABASE=1)')

async function keepWish(page: Page, title: string) {
  await page.goto('/home')
  await page.getByRole('button', { name: 'J’aimerais…' }).click()
  await page.getByRole('textbox', { name: 'Ton envie' }).fill(title)
  await page.getByRole('button', { name: 'Garder' }).click()
  await page.getByRole('button', { name: 'Oui' }).click()
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
}

test.describe('Fiche complète (avec Supabase)', () => {
  test('donner vie à une envie, section par section, puis la relire', async ({ page }) => {
    await keepWish(page, 'Dormir une nuit à la belle étoile')
    await page.getByRole('link', { name: 'Compléter la fiche' }).click()

    // 1. Nommer
    await page.getByLabel(/^Accroche/).fill('Voir la Voie lactée de mes propres yeux.')
    await page
      .getByRole('button', { name: /^Continuer/ })
      .first()
      .click()

    // 2. Décrire
    await expect(page).toHaveURL(/\/edit\/describe$/)
    const editor = page.getByRole('textbox', { name: 'Description' })
    await editor.click()
    await page.keyboard.type('Un plateau du Vercors en août.')
    await page
      .getByRole('button', { name: /Ajouter la question : Qu’est-ce qui me donne envie/ })
      .click()
    await page.keyboard.type('Le silence, surtout.')
    await page.getByLabel(/^Où, avec qui/).fill('Plateau d’Ambel, avec Léa.')
    await page
      .getByRole('button', { name: /^Continuer/ })
      .first()
      .click()

    // 3. Le pourquoi
    await expect(page).toHaveURL(/\/edit\/why$/)
    await page.getByLabel(/^Pourquoi c’est important pour toi/).fill('Parce que ça me manque.')
    await page.getByText('Liberté', { exact: true }).click()
    await page
      .getByRole('button', { name: /^Continuer/ })
      .first()
      .click()

    // 6. Premières pistes
    await page
      .getByLabel(/^Quelle serait la toute première petite étape/)
      .fill('Chercher les zones de bivouac autorisées')
    await page
      .getByRole('button', { name: /^Continuer/ })
      .first()
      .click()

    // 7. Relire & garder
    await expect(page).toHaveURL(/\/edit\/review$/)
    await page.getByText('Envie confirmée', { exact: true }).click()
    await page.getByRole('button', { name: 'Garder et revenir à la page' }).click()

    // The notebook page shows everything, nothing was lost.
    await expect(page.getByText('Voir la Voie lactée de mes propres yeux.')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Qu’est-ce qui me donne envie là-dedans ?' }),
    ).toBeVisible()
    await expect(page.getByText('Le silence, surtout.')).toBeVisible()
    await expect(page.getByText('Parce que ça me manque.')).toBeVisible()
    await expect(page.getByRole('listitem').filter({ hasText: 'Liberté' })).toBeVisible()
    await expect(page.getByText('Chercher les zones de bivouac autorisées')).toBeVisible()
    await expect(page.getByText('Envie confirmée').first()).toBeVisible()
  })

  test('revenir à une version précédente sans rien perdre', async ({ page }) => {
    await keepWish(page, 'Apprendre le violoncelle')
    const detail = page.url()
    await page.getByRole('link', { name: 'Compléter la fiche' }).click()
    await page.getByLabel(/^Accroche/).fill('Première version')
    await page
      .getByRole('button', { name: /^Continuer/ })
      .first()
      .click()
    await expect(page).toHaveURL(/\/edit\/describe$/)

    await page.goto(`${detail}/edit/name`)
    await page.getByLabel(/^Accroche/).fill('Seconde version')
    await expect(page.getByRole('status').filter({ hasText: 'Enregistré' })).toBeVisible()
    await page.waitForTimeout(1000)

    await page.goto(`${detail}/history`)
    await page.getByRole('button', { name: 'Revenir à cette version' }).first().click()
    await page.getByRole('button', { name: 'Revenir', exact: true }).click()
    await expect(
      page.getByText('C’est fait. La version précédente reste dans l’historique.'),
    ).toBeVisible()

    await page.goto(detail)
    await expect(page.getByText('Première version')).toBeVisible()
    await page.goto(`${detail}/history`)
    await expect(page.getByText('Seconde version')).toBeVisible()
  })
})
