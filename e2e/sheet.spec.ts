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
    await expect(pageArticle.getByText('Voir la Voie lactée de mes propres yeux.')).toBeVisible()
    await expect(
      pageArticle.getByRole('heading', { name: 'Qu’est-ce qui me donne envie là-dedans ?' }),
    ).toBeVisible()
    await expect(pageArticle.getByText('Le silence, surtout.')).toBeVisible()
    await expect(pageArticle.getByText('Parce que ça me manque.')).toBeVisible()
    await expect(pageArticle.getByRole('listitem').filter({ hasText: 'Liberté' })).toBeVisible()
    await expect(pageArticle.getByText('Chercher les zones de bivouac autorisées')).toBeVisible()
    await expect(pageArticle.getByText('Envie confirmée')).toBeVisible()
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

  test('préciser (SMART), qualifier, puis laisser partir avec un mot', async ({ page }) => {
    await keepWish(page, 'Courir 5 km')
    const detail = page.url()

    // 4. Préciser
    await page.goto(`${detail}/edit/smart`)
    await page
      .getByLabel(/^Que veux-tu accomplir précisément/)
      .fill('Courir 5 km d’affilée dans mon quartier')
    for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Suivant' }).click()
    await page.getByLabel(/^Pour quand, ou à quel rythme/).fill('D’ici fin juin')
    await page.getByRole('button', { name: 'Voir ma phrase' }).click()
    await expect(page.getByRole('textbox', { name: 'Ta phrase' })).toHaveValue(
      'D’ici fin juin, courir 5 km d’affilée dans mon quartier.',
    )
    await page
      .getByRole('button', { name: /^Continuer/ })
      .first()
      .click()

    // 5. Qualifier
    await expect(page).toHaveURL(/\/edit\/qualify$/)
    await page.getByText('Sport & santé', { exact: true }).click()
    await page.getByText('Exigeant', { exact: true }).click()
    await page.getByText('Été', { exact: true }).click()
    const tag = page.getByLabel(/^Tags/)
    await tag.fill('quartier')
    const saved = page.waitForResponse((r) => r.url().endsWith('/tags') && r.ok())
    await tag.press('Enter')
    await saved

    // 7. Relire & garder : laisser partir, avec un mot
    await page.goto(`${detail}/edit/review`)
    await page.getByText('Lâché consciemment', { exact: true }).click()
    await page.getByLabel(/^Un mot pour plus tard/).fill('Mes genoux préfèrent la natation.')
    await page.getByRole('button', { name: 'Garder et revenir à la page' }).click()

    await expect(
      page.getByRole('link', { name: /Compléter la fiche|Modifier la fiche/ }),
    ).toBeVisible()
    const article = page
      .locator('article')
      .filter({ visible: true })
      .filter({ has: page.getByRole('heading', { level: 1 }) })
    await expect(
      article.getByText('D’ici fin juin, courir 5 km d’affilée dans mon quartier.'),
    ).toBeVisible()
    await expect(article.getByText('Exigeant')).toBeVisible()
    await expect(article.getByText('Sport & santé')).toBeVisible()
    await expect(article.getByText('#quartier')).toBeVisible()
    await expect(
      article.getByText('Tu as choisi de laisser partir cette envie.', { exact: false }),
    ).toBeVisible()
    await expect(article.getByText('Mes genoux préfèrent la natation.')).toBeVisible()
  })
})
