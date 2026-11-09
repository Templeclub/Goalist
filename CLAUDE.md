# CLAUDE.md — Élan (nom provisoire)

Ce fichier guide tout travail de développement sur ce dépôt. À lire avant chaque session.

## Vision

Élan est une PWA mobile-first pour **mettre par écrit ses envies, projets et objectifs**, puis les **nommer, décrire et qualifier** à son rythme. Écrire une envie, c'est déjà s'engager : l'outil doit rendre ce geste facile, agréable et complet.

Le périmètre actuel couvre la capture (express et fiche guidée en 4 sections : l'envie, le pourquoi, préciser, premier pas), la collection de cartes (cartes à convertir, rareté, conversion, collection des cartes acquises), les recommandations d'accueil, et le compte. Communauté, tableau de bord, rappels et check-ins viendront plus tard : le modèle de données les anticipe, le code ne les implémente pas.

## Règles non négociables

1. **Aucune IA.** Aucun appel à un LLM ni à un service de génération. L'accompagnement passe par des textes écrits à la main, des exemples et des questions guidées. Seules exceptions : des correspondances déterministes écrites à la main (ex. mots-clés du titre → emoji et catégorie, D-059), toujours modifiables.
2. **Seul le titre est obligatoire.** Aucun autre champ ne bloque jamais l'utilisateur.
3. **Aucune perte de saisie.** Sauvegarde automatique continue ; pas de bouton « Enregistrer ».
4. **Ton bienveillant.** Pas de rouge d'alerte (sauf actions destructrices), pas de streak, pas de niveau de joueur ni de points, pas de classement, pas de pourcentage anxiogène, pas de « en retard » ni « abandonné ». La collection de cartes (rareté, cartes acquises, D-062) est permise : rien ne se perd, tout s'annule. Voir [`docs/principles.md`](docs/principles.md).
5. **Aucun texte en dur.** Tout passe par `next-intl` (`src/i18n/messages/<locale>/*.json`). Produit en français, tutoiement.
6. **RLS d'abord.** Par défaut seul le propriétaire accède à ses données. La clé `service_role` ne s'utilise que dans `src/server/admin/`.
7. **Design system d'abord.** Tokens sémantiques uniquement (jamais de couleur littérale dans un composant). Un composant existe dans Storybook avant d'être utilisé dans un écran. Un écran est décrit dans `docs/screens/` avant d'être codé.
8. **Accessibilité WCAG 2.2 AA** : contrastes, focus visibles, clavier complet, cibles ≥ 44 px, jamais d'information portée par la couleur seule, `prefers-reduced-motion` respecté.

## Stack

- Next.js (App Router) + TypeScript strict, pnpm
- Tailwind CSS v4 (tokens via `@theme`, variables dans `src/styles/tokens.css`), shadcn/ui personnalisé, vaul (bottom sheets), Lucide (icônes)
- next-intl, Zod (toutes les entrées serveur), Zustand (store de fiche), react-hook-form (formulaires classiques seulement)
- Tiptap (schéma restreint), stockage ProseMirror JSON + texte dérivé
- Supabase : Postgres + Auth + Storage, migrations SQL dans `supabase/migrations/`, types générés, pas d'ORM
- Serwist (service worker), Dexie (file de patchs hors ligne)
- Tests : Vitest + Testing Library, Playwright (mobile + desktop, clair + sombre), pgTAP (RLS), axe, Lighthouse CI
- Qualité : ESLint, Prettier, Husky + lint-staged, commitlint, GitHub Actions, Storybook
- Déploiement : Vercel (région `cdg1`) + Supabase (région UE). Sentry (sans contenu utilisateur), Plausible.

Détails et justifications : [`docs/plan.md`](docs/plan.md) et [`docs/decisions.md`](docs/decisions.md).

## Conventions

- **Langue** : code, noms de fichiers, variables, commits et segments d'URL en anglais. Textes produits en français dans les fichiers de messages.
- **Nom du produit** : jamais écrit en dur. `APP_NAME` dans `src/config/app.ts`, et `{appName}` dans les messages.
- **Commits** : Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `style:`), atomiques, portée facultative (`feat(capture): …`).
- **Branches** : `main` protégée ; une branche par phase ou par fonctionnalité, PR avec preview Vercel.
- **Fichiers** : composants en `PascalCase.tsx`, le reste en `kebab-case.ts`. Une story `*.stories.tsx` et un test `*.test.ts(x)` à côté de chaque composant ou module métier.
- **Clés i18n** : `domaine.ecran.element` (ex. `capture.express.placeholder`). Les catégories et valeurs système sont des clés (`categories.sport_health`).
- **Données** : énumérations en `text` + `CHECK` côté SQL, schéma Zod correspondant dans `src/features/*/schema.ts`. Chaque migration qui touche une table ajoute ou met à jour ses tests pgTAP.
- **Écriture** : les modifications d'une envie passent par `PATCH /api/goals/:id` (patch par champ, `baseVersion`, `clientMutationId`). Pas de Server Action pour ce qui peut être rejoué hors ligne.
- **Styles** : uniquement des tokens (`bg-card`, `bg-paper`, `text-ink-2`, `bg-tone-bg` + `data-tone`). Rayons, espacements et durées viennent du design system.
- **Mouvement** : 150–250 ms, désactivé sous `prefers-reduced-motion`. Pas de confettis, pas de sons.

## Commandes

Cette liste fait foi.

| Commande                                       | Rôle                                                  |
| ---------------------------------------------- | ----------------------------------------------------- |
| `pnpm dev`                                     | Serveur de développement                              |
| `pnpm build` / `pnpm start`                    | Build et serveur de production                        |
| `pnpm lint` / `pnpm typecheck` / `pnpm format` | Qualité                                               |
| `pnpm test`                                    | Tests unitaires et composants (Vitest)                |
| `pnpm e2e`                                     | Tests Playwright (`pnpm e2e -- --trace off` en local) |
| `pnpm e2e:visual`                              | Tests de non-régression visuelle                      |
| `pnpm storybook` / `pnpm storybook:build`      | Storybook                                             |
| `pnpm db:start` / `pnpm db:reset`              | Supabase local (Docker)                               |
| `pnpm db:migrate:new <nom>`                    | Nouvelle migration SQL                                |
| `pnpm db:test`                                 | Tests pgTAP (RLS, contraintes)                        |
| `pnpm db:types`                                | Régénère `src/lib/supabase/database.types.ts`         |
| `pnpm db:test:local` / `pnpm db:types:local`   | Même chose sans Docker (PostgreSQL local + pgTAP)     |

## Points d'attention

- **Next.js 16.4** : plusieurs conventions ont changé (`proxy.ts` au lieu de `middleware.ts`, Cache Components activé). Lire la doc fournie dans `node_modules/next/dist/docs/` avant d'utiliser une API (voir `AGENTS.md`).
- **Cache Components** : toute lecture de session (`cookies()`) se fait dans un composant placé sous `<Suspense>` avec un squelette, jamais au niveau d'un layout.
- **Environnement cloud derrière un proxy** : Node n'utilise pas `HTTPS_PROXY` par défaut. Lancer le serveur ou les tests avec `NODE_USE_ENV_PROXY=1` pour que le code serveur joigne Supabase (sinon `ENOTFOUND`, et toute requête authentifiée répond 401).
- **Tests E2E** : `playwright.config.ts` construit et lance son propre serveur ; arrêter tout `next start` qui tournerait déjà sur le port 3100.

## Définition de « terminé »

- Tests unitaires, composants, pgTAP et E2E verts ; types et lint propres.
- Story à jour pour tout composant touché (clair + sombre, mobile + desktop).
- Aucun texte en dur ; textes relus selon `docs/principles.md`.
- Vérifié au clavier et avec un lecteur d'écran pour les écrans touchés.
- `README` et docs mis à jour ; décision notable ajoutée à `docs/decisions.md`.

## Documents

- [`docs/plan.md`](docs/plan.md) — architecture, modèle de données, phases, risques
- [`docs/principles.md`](docs/principles.md) — ton, motivation, garde-fous, lexique
- [`docs/design-system.md`](docs/design-system.md) — directions artistiques, tokens, composants
- [`docs/decisions.md`](docs/decisions.md) — décisions et leurs raisons
- [`docs/screens/`](docs/screens/) — description de chaque écran avant implémentation
- [`docs/mockups/maquettes.html`](docs/mockups/maquettes.html) — maquettes statiques
