# Élan (nom provisoire)

Un carnet d'envies, de projets et d'objectifs : une PWA mobile-first pour **écrire une envie en quelques secondes**, puis la **nommer, la décrire et la qualifier** à son rythme. Sans pression, sans classement, sans intelligence artificielle.

> **État** : phase 4 (consulter et retrouver). Recherche plein texte (`/`), filtres rapides et combinables, tris, regroupements, master-detail sur ordinateur, fiches à compléter. Voir [`docs/plan.md`](docs/plan.md).

## Stack

Next.js 16 (App Router, Cache Components) · TypeScript strict · Tailwind CSS 4 · next-intl · Supabase (Postgres + RLS, Auth, Storage) · Zod · vaul · Lucide · Storybook 10 · Vitest · Playwright · pgTAP · pnpm.

## Démarrer

Prérequis : Node 22 (`.nvmrc`), pnpm 10, Docker pour la pile Supabase locale.

```bash
pnpm install
```

```bash
cp .env.example .env.local
```

```bash
pnpm dev
```

La page publique fonctionne sans Supabase. Pour la base de données et les services, suivre [`docs/setup.md`](docs/setup.md).

## Commandes

| Commande                                           | Rôle                                                       |
| -------------------------------------------------- | ---------------------------------------------------------- |
| `pnpm dev`                                         | Serveur de développement                                   |
| `pnpm build` / `pnpm start`                        | Build et serveur de production                             |
| `pnpm lint` / `pnpm typecheck` / `pnpm format`     | Qualité                                                    |
| `pnpm test`                                        | Tests unitaires et composants (Vitest)                     |
| `pnpm e2e`                                         | Tests Playwright mobile + desktop, avec audit axe          |
| `pnpm e2e:visual`                                  | Non-régression visuelle (clair / sombre, mobile / desktop) |
| `pnpm storybook` / `pnpm storybook:build`          | Storybook (design system)                                  |
| `pnpm db:start` / `pnpm db:reset` / `pnpm db:test` | Supabase local (Docker) et tests pgTAP                     |
| `pnpm db:test:local`                               | Migrations + pgTAP sur un PostgreSQL local, sans Docker    |
| `pnpm db:types` / `pnpm db:types:local`            | Régénère `src/lib/supabase/database.types.ts`              |

## Organisation

```
src/
  app/            routes (segment [locale] réécrit par le proxy, sans préfixe d'URL)
  components/     ui/ (primitives), goal/ (cartes, pastilles), layout/ (navigation)
  features/       logique métier par domaine (schémas Zod, palette)
  i18n/           next-intl : routage, messages fr/ et en/
  lib/supabase/   clients navigateur, serveur, proxy + types générés
  server/admin/   seul endroit autorisé à utiliser la clé secrète
  styles/         tokens du design system
supabase/         config, migrations SQL, tests pgTAP
e2e/              tests Playwright
docs/             plan, principes, design system, décisions, écrans, maquettes
```

## Documents

- [Plan d'implémentation](docs/plan.md)
- [Principes de ton](docs/principles.md)
- [Design system](docs/design-system.md)
- [Décisions](docs/decisions.md)
- [Écrans](docs/screens/)
- [Mise en place des services](docs/setup.md)
- [Instructions pour les agents de code](CLAUDE.md)
