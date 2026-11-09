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
  test('donner vie à une envie en quatre sections, puis la relire', async ({ page }) => {
    await keepWish(page, 'Dormir une nuit à la belle étoile')
    // The category is already guessed: "Compléter la fiche" opens the first empty section.
    await page.getByRole('link', { name: 'Compléter la fiche' }).click()
    await expect(page).toHaveURL(/\/edit\/why$/)
    await page.goto(page.url().replace(/\/why$/, '/name'))

    // 1. L'envie : emoji et catégorie déjà devinés d'après le titre
    await expect(page.getByLabel(/^Emoji/)).toHaveValue('🏕️')
    await expect(page.getByRole('checkbox', { name: /Voyage/ })).toBeChecked()
    const editor = page.getByRole('textbox', { name: 'Description' })
    await editor.click()
    await page.keyboard.type('Un plateau du Vercors en août.')
    await page
      .getByRole('button', { name: /^Continuer/ })
      .first()
      .click()

    // 2. Le pourquoi
    await expect(page).toHaveURL(/\/edit\/why$/)
    await page.getByLabel(/^Pourquoi c’est important pour toi/).fill('Parce que ça me manque.')
    await page.getByText('Liberté', { exact: true }).click()
    await page
      .getByRole('button', { name: /^Continuer/ })
      .first()
      .click()

    // 3. Préciser : ce qu'il faut, et pour quand
    await expect(page).toHaveURL(/\/edit\/smart$/)
    await page
      .getByRole('textbox', { name: /Qu’est-ce qui rend ça possible/ })
      .fill('Un duvet chaud et une carte.')
    await page.getByText('Importante', { exact: true }).click()
    await page.getByText('Long, plus d’un an', { exact: true }).click()
    await page.getByText('Été', { exact: true }).click()
    await page
      .getByRole('button', { name: /^Continuer/ })
      .first()
      .click()

    // 4. Premier pas
    await expect(page).toHaveURL(/\/edit\/first-steps$/)
    await page
      .getByLabel(/^Quelle serait la toute première petite étape/)
      .fill('Chercher les zones de bivouac autorisées')
    await page.getByText('Envie confirmée', { exact: true }).click()
    await page.getByRole('button', { name: 'Garder et revenir à la page' }).click()

    // The notebook page shows everything, nothing was lost.
    await expect(page).toHaveURL(/\/goals\/[0-9a-f-]+$/)
    // The URL changes before the new page is committed: wait for the detail page itself.
    await expect(
      page.getByRole('link', { name: /Compléter la fiche|Modifier la fiche/ }),
    ).toBeVisible()
    // Next keeps visited routes in the DOM, hidden (React Activity): only look at the visible page.
    const pageArticle = page
      .locator('article')
      .filter({ visible: true })
      .filter({ has: page.getByRole('heading', { level: 1 }) })
      .first()
    await expect(pageArticle.getByText('Un plateau du Vercors en août.')).toBeVisible()
    await expect(pageArticle.getByText('Parce que ça me manque.')).toBeVisible()
    await expect(pageArticle.getByRole('listitem').filter({ hasText: 'Liberté' })).toBeVisible()
    await expect(pageArticle.getByText('Un duvet chaud et une carte.')).toBeVisible()
    await expect(pageArticle.getByText('Plus tard')).toBeVisible()
    await expect(pageArticle.getByText('À anticiper')).toBeVisible()
    await expect(pageArticle.getByText('Chercher les zones de bivouac autorisées')).toBeVisible()
  })

  test('revenir à une version précédente sans rien perdre', async ({ page }) => {
    await keepWish(page, 'Apprendre le violoncelle')
    const detail = page.url()
    await page.goto(`${detail}/edit/why`)
    await page.getByLabel(/^Pourquoi c’est important pour toi/).fill('Première version')
    await page
      .getByRole('button', { name: /^Continuer/ })
      .first()
      .click()
    await expect(page).toHaveURL(/\/edit\/smart$/)

    await page.goto(`${detail}/edit/why`)
    await page.getByLabel(/^Pourquoi c’est important pour toi/).fill('Seconde version')
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

  test('les anciens liens de section mènent au bon endroit, puis laisser partir', async ({
    page,
  }) => {
    await keepWish(page, 'Courir 5 km')
    const detail = page.url()

    await page.goto(`${detail}/edit/qualify`)
    await expect(page).toHaveURL(/\/edit\/smart$/)
    await page.goto(`${detail}/edit/review`)
    await expect(page).toHaveURL(/\/edit\/first-steps$/)

    await page.getByText('Rangée', { exact: true }).click()
    await page.getByLabel(/^Un mot pour plus tard/).fill('Mes genoux préfèrent la natation.')
    await page.getByRole('button', { name: 'Garder et revenir à la page' }).click()

    await expect(
      page.getByRole('link', { name: /Compléter la fiche|Modifier la fiche/ }),
    ).toBeVisible()
    const article = page
      .locator('article')
      .filter({ visible: true })
      .filter({ has: page.getByRole('heading', { level: 1 }) })
      .first()
    await expect(article.getByText('Sport & santé')).toBeVisible()
    await expect(article.getByText('Cette carte est rangée.', { exact: false })).toBeVisible()
    await expect(article.getByText('Mes genoux préfèrent la natation.')).toBeVisible()
  })
})
