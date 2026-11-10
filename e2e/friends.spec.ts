import { expect, test, type Browser, type Page } from '@playwright/test'

/* Needs a Supabase backend (CI local stack, E2E_SUPABASE=1) and its secret key. */
test.skip(
  !process.env.E2E_SUPABASE || !process.env.SUPABASE_SECRET_KEY,
  'requires a Supabase backend (E2E_SUPABASE=1) and SUPABASE_SECRET_KEY',
)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const secretKey = process.env.SUPABASE_SECRET_KEY ?? ''
const adminHeaders = {
  apikey: secretKey,
  ...(secretKey.startsWith('eyJ') ? { Authorization: `Bearer ${secretKey}` } : {}),
  'Content-Type': 'application/json',
}

/** A confirmed account with a pseudo, made through the Auth admin API (e-mails are confirmed). */
async function createAccount(name: string) {
  const email = `${name.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.test`
  const password = 'un-mot-de-passe-solide'
  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ email, password, email_confirm: true }),
  })
  const user = (await res.json()) as { id: string }
  await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}`, {
    method: 'PATCH',
    headers: { ...adminHeaders, Prefer: 'return=minimal' },
    body: JSON.stringify({ display_name: name }),
  })
  return { email, password }
}

async function signedIn(browser: Browser, name: string): Promise<Page> {
  const account = await createAccount(name)
  const page = await (await browser.newContext()).newPage()
  await page.goto('/sign-in')
  await page.getByRole('button', { name: 'Utiliser un mot de passe' }).click()
  await page.getByLabel('Ton adresse e-mail').fill(account.email)
  await page.getByLabel('Mot de passe', { exact: true }).fill(account.password)
  await page.getByRole('button', { name: 'Me connecter' }).click()
  await page.waitForURL(/\/home$/)
  return page
}

test.describe('Amis (avec Supabase)', () => {
  test('inviter, partager une carte, être encouragé', async ({ browser }) => {
    const title = 'Dormir à la belle étoile'
    const alice = await signedIn(browser, 'Alice')
    const bob = await signedIn(browser, 'Bob')

    // Alice keeps a card and shares it with her friends.
    await alice.getByRole('button', { name: 'J’aimerais…' }).click()
    await alice.getByRole('textbox', { name: 'Ton envie' }).fill(title)
    await alice.getByRole('button', { name: 'Garder' }).click()
    await alice.getByRole('button', { name: 'Oui' }).click()
    await expect(alice.getByRole('heading', { level: 1, name: title })).toBeVisible()
    const cardUrl = alice.url()
    await alice.getByRole('radio', { name: 'Mes amis' }).click()
    await expect(alice.getByRole('radio', { name: 'Mes amis' })).toHaveAttribute(
      'aria-checked',
      'true',
    )

    // Her invite link.
    await alice.goto('/friends')
    await alice.getByRole('button', { name: 'Créer mon lien d’invitation' }).click()
    const link = (await alice.getByText(/\/friends\/invite\//).textContent())!.trim()

    // Bob accepts it and sees the shared card.
    await bob.goto(new URL(link).pathname)
    await expect(bob.getByText('Alice t’invite à être ami·e')).toBeVisible()
    await bob.getByRole('button', { name: 'Accepter l’invitation' }).click()
    await bob.waitForURL(/\/friends$/)
    const main = bob.locator('main').filter({ visible: true })
    await expect(main.getByText('Carte de Alice')).toBeVisible()
    await main.getByRole('link', { name: title }).click()

    // He cheers her on, writes a word and wants it too.
    await bob.getByRole('button', { name: 'Bravo' }).click()
    await expect(bob.getByRole('button', { name: 'Bravo · 1' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await bob.getByRole('textbox', { name: 'Ton message' }).fill('Prends un bon duvet !')
    await bob.getByRole('button', { name: 'Envoyer' }).click()
    await expect(bob.getByText('Prends un bon duvet !')).toBeVisible()
    await bob.getByRole('button', { name: 'Moi aussi' }).click()
    await expect(bob.getByRole('button', { name: /Tu aimerais aussi/ })).toBeVisible()

    // Alice's card stays hers: never in Bob's own cards, and read-only when he opens it.
    await expect(bob.getByText(/en lecture seule/)).toBeVisible()
    for (const path of ['/goals', '/home', '/collection']) {
      await bob.goto(path)
      await expect(bob.locator('main').filter({ visible: true })).toBeVisible()
      await expect(bob.getByRole('link', { name: title })).toHaveCount(0)
    }
    await bob.goto(new URL(cardUrl).pathname)
    await bob.waitForURL(/\/friends\/cards\//)
    await expect(bob.getByRole('link', { name: /Modifier|Compléter/ })).toHaveCount(0)

    // Her profile lists every card she shares with him.
    await bob.goto('/friends')
    await bob.getByRole('link', { name: 'Voir les cartes de Alice' }).click()
    await expect(bob.getByRole('heading', { level: 1, name: 'Les cartes de Alice' })).toBeVisible()
    await expect(
      bob.locator('main').filter({ visible: true }).getByRole('link', { name: title }),
    ).toBeVisible()

    // Alice sees it on her side.
    await alice.goto('/friends')
    await expect(alice.getByText(/Bob : Bravo sur/)).toBeVisible()
    await alice.goto(cardUrl)
    const side = alice.getByRole('region', { name: 'Côté amis' })
    await expect(side.getByText('Bravo · 1')).toBeVisible()
    await expect(side.getByText('Prends un bon duvet !')).toBeVisible()
    await expect(side.getByText(/1 ami aimerait aussi/)).toBeVisible()
  })
})
