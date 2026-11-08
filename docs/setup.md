# Mise en place des services

Tout ce qui peut vivre dans le dépôt y est déjà : migrations, `supabase/config.toml`, `vercel.json`, `.env.example`, CI. Ce guide liste les **actions humaines** restantes (créer des comptes, coller des clés), dans l'ordre. Compte environ 45 minutes.

> Rien ici ne demande de toucher au code. Si une étape bloque, note où et je m'adapte.

## 1. GitHub (`Templeclub/goalist`)

1. **Protéger `main`** : Settings → Branches → Add rule → `main` → cocher « Require a pull request before merging » et « Require status checks to pass » (choisir `Lint, types, tests unitaires, build`, `Base de données (migrations + pgTAP)`, `E2E (mobile + desktop, axe)` après le premier passage de la CI).
2. Rien d'autre : la CI n'a besoin d'aucun secret pour l'instant.

## 2. Supabase (base de données, comptes, images)

### 2.1 Créer le projet

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Nom : `elan` · Région : **West EU (Paris)** (`eu-west-3`) · Mot de passe de base : généré, à garder dans un gestionnaire de mots de passe.
3. Plan : Free suffit pour le développement ; passer en Pro avant l'ouverture publique (sauvegardes quotidiennes, pas de mise en pause).

### 2.2 Récupérer les clés

Project Settings → **API Keys** :

| Valeur                               | Variable                                   |
| ------------------------------------ | ------------------------------------------ |
| Project URL                          | `NEXT_PUBLIC_SUPABASE_URL`                 |
| Publishable key (`sb_publishable_…`) | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`     |
| Secret key (`sb_secret_…`)           | `SUPABASE_SECRET_KEY` (serveur uniquement) |

### 2.3 Appliquer le schéma

Depuis le dépôt, une seule fois puis à chaque nouvelle migration :

```bash
pnpm exec supabase login
```

```bash
pnpm exec supabase link --project-ref <ref-du-projet>
```

```bash
pnpm exec supabase db push
```

Le `ref` est dans l'URL du tableau de bord (`/project/<ref>`).

### 2.4 Réglages d'authentification

Authentication → **Sign In / Providers** :

- **Email** : activé, « Confirm email » activé, longueur minimale du mot de passe 10.
- **Anonymous sign-ins** : **activé** (première envie avant le compte, décision D-030).
- **Allow manual linking** : activé (pour transformer une session anonyme en compte).
- **Google** : activé, avec l'identifiant et le secret créés à l'étape 4.

Authentication → **URL Configuration** :

- Site URL : l'URL de production (ex. `https://elan.app`), ou celle de Vercel en attendant.
- Redirect URLs : `http://localhost:3000/**`, `https://<projet>.vercel.app/**`, `https://*-templeclub.vercel.app/**` (aperçus de PR).

Authentication → **Attack Protection** :

- CAPTCHA : **Turnstile**, avec la clé secrète créée à l'étape 5.

Authentication → **Emails → SMTP Settings** (avant l'ouverture publique) : brancher un fournisseur d'e-mails hébergé dans l'UE (ex. Brevo). Le SMTP intégré de Supabase est limité à quelques e-mails par heure.

### 2.5 Vérifier

Database → Extensions : `pg_cron`, `pg_trgm` et `unaccent` doivent apparaître comme activées après `db push`. Integrations → Cron : deux tâches `elan-purge-trash` et `elan-purge-anonymous`.

## 3. Vercel (hébergement)

1. [vercel.com/new](https://vercel.com/new) → importer `Templeclub/goalist`. Framework détecté : Next.js. Ne rien changer aux commandes (`vercel.json` fixe pnpm et la région `cdg1`, Paris).
2. **Environment Variables** (Production **et** Preview) :
   - `NEXT_PUBLIC_SITE_URL` : l'URL publique
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY` (cocher « Sensitive »)
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
3. Deploy. Chaque PR aura ensuite son aperçu.
4. Domaine (quand le nom sera choisi) : Settings → Domains.

## 4. Google (connexion « Continuer avec Google »)

1. [console.cloud.google.com](https://console.cloud.google.com) → nouveau projet `elan`.
2. APIs & Services → **OAuth consent screen** : type External, nom de l'app, e-mail de contact, logo (`public/icons/icon-512.png`), domaine. Portées : `email`, `profile`, `openid` uniquement.
3. **Credentials → Create credentials → OAuth client ID** → Web application.
   - Authorized redirect URI : `https://<ref-du-projet>.supabase.co/auth/v1/callback`
4. Copier le Client ID et le Client secret dans Supabase (étape 2.4).

## 5. Cloudflare Turnstile (anti-abus des sessions anonymes)

1. [dash.cloudflare.com](https://dash.cloudflare.com) → Turnstile → **Add site** → mode « Managed » (invisible la plupart du temps).
2. Domaines : `localhost`, le domaine Vercel, le domaine final.
3. Site key → `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (Vercel) · Secret key → Supabase (étape 2.4).

## 6. Développement local

Prérequis : Node 22, pnpm 10, Docker (pour la pile Supabase locale).

```bash
pnpm install
```

```bash
pnpm db:start
```

```bash
cp .env.example .env.local
```

Reporter dans `.env.local` l'URL et les clés affichées par `pnpm db:start`, puis :

```bash
pnpm dev
```

Sans Docker, `pnpm db:test:local` applique les migrations et lance les tests pgTAP sur un PostgreSQL local (16+, avec l'extension pgTAP).

## 7. Plus tard (phases 4 et 5)

- **Upstash** (limitation de débit) : base Redis en région `eu-west-1`, variables `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN`.
- **Sentry** (erreurs) : projet Next.js en région UE (`de.sentry.io`), `NEXT_PUBLIC_SENTRY_DSN`. Le scrubbing du contenu des envies est configuré dans le code.
- **Plausible** (mesure d'audience sans cookie, hébergée dans l'UE) : `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`.
- **RGPD** : accepter les DPA de Supabase et de Vercel (dans leurs réglages d'organisation), tenir le registre des traitements.

## 8. Captures de référence visuelles

Les tests visuels comparent la page à des captures de référence générées dans l'image Docker Playwright de la CI. Pour les créer la première fois : Actions → CI → **Run workflow** → cocher « Régénérer les captures de référence ». Télécharger l'artefact `visual-snapshots` et committer le dossier `e2e/visual.spec.ts-snapshots/`.
