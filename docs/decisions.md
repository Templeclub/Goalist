# Journal des décisions

Format court : contexte, décision, alternatives écartées. Chaque décision peut être rediscutée ; on ajoute alors une nouvelle entrée qui remplace l'ancienne plutôt que de réécrire l'histoire.

Statuts : **Proposée** · **Acceptée** · **Remplacée**.

> 8 novembre 2026 : feu vert reçu. Les décisions D-001 à D-028 sont appliquées par défaut à partir de la phase 0 (aucune objection). D-029 à D-031 tranchent les trois questions bloquantes du plan.

---

### D-001 · Nom du produit centralisé — Proposée

`APP_NAME = "Élan"` dans `src/config/app.ts`, injecté dans les messages via `{appName}`. Le manifeste PWA, les métadonnées et les e-mails le lisent au même endroit.

### D-002 · Supabase sans ORM — Proposée

Migrations SQL via la CLI Supabase, types générés par `supabase gen types`, accès aux données par `supabase-js` avec la session utilisateur.
_Pourquoi_ : la RLS est la frontière de sécurité. Drizzle ou Prisma en connexion directe utilisent un rôle qui contourne la RLS, sauf à reconstruire le contexte JWT à chaque transaction. Les politiques, triggers et la config de recherche française s'écrivent de toute façon en SQL.
_Écartées_ : Drizzle (bon outil, mais deux sources de vérité pour le schéma et risque de contournement), Prisma (même risque, client plus lourd).

### D-003 · Route Handlers pour les écritures rejouables — Proposée

Les patchs de la sauvegarde auto passent par `PATCH /api/goals/:id`, pas par des Server Actions.
_Pourquoi_ : les identifiants de Server Actions changent à chaque déploiement, ce qui casse le rejeu d'une file hors ligne. Server Actions autorisées pour les formulaires non rejouables (réglages).

### D-004 · Identifiants UUIDv7 générés côté client — Proposée

Pour `goals` (et médias). Création idempotente hors ligne, tri chronologique naturel.

### D-005 · Sauvegarde par patch de champ — Proposée

Debounce de 700 ms, patch `{ field, value, baseVersion, clientMutationId }`, la dernière écriture gagne par champ, l'ancienne valeur reste dans l'historique. Indicateur « Enregistrement… » seulement après 400 ms.

### D-006 · Pas de table `drafts` — Proposée

L'envie est son propre brouillon dès « Garder ». Seul le texte de la capture express non gardé est conservé localement (IndexedDB) si l'app se ferme.
_Écartée_ : une table `drafts` côté serveur, qui ferait doublon avec `goals` et compliquerait la synchronisation.

### D-007 · Historique par instantanés regroupés — Proposée

Instantané dans `goal_revisions` à la sortie d'une section, à « Relire & garder » ou toutes les 10 minutes d'édition. 50 instantanés conservés par envie. Restauration = nouvel instantané (`reason = 'restore'`), rien n'est effacé.

### D-008 · Texte riche : Tiptap, schéma restreint — Proposée

Paragraphe, titre de niveau 3, listes à puces et numérotées, gras, italique, lien. Stockage ProseMirror JSON (`description_doc`) + texte brut dérivé (`description_text`) pour la recherche ; conversion Markdown à l'export. Les « questions de relance » insèrent un titre de niveau 3.

### D-009 · Énumérations en `text` + `CHECK` — Proposée

Plus simples à faire évoluer que les enums Postgres (ajout, renommage). Zod est la source de vérité côté TypeScript.

### D-010 · Recherche française sans accents — Proposée

Configuration `fr_unaccent` (copie de `french` + `unaccent`), `search_vector` maintenu par trigger avec poids, `pg_trgm` sur le titre.

### D-011 · i18n sans préfixe d'URL, segments en anglais — Proposée

Langue : profil → cookie → `Accept-Language`. Segments d'URL en anglais (`/goals/:id`), cohérents avec le code. Français seul au lancement, structure anglaise présente.

### D-012 · Authentification — Acceptée, complétée par D-030

Lien magique par défaut, mot de passe possible, Google. Vérification e-mail obligatoire avant toute donnée stockée côté serveur (sauf si la question 2 du plan conclut à une session anonyme). Case de déclaration « J'ai 15 ans ou plus » à l'inscription, horodatée dans `profiles.age_confirmed_at`.

### D-013 · Visibilité : options futures visibles, désactivées — Proposée

Le sélecteur montre « Privé » (actif), « Cercle d'amis » et « Communauté » avec la mention « Bientôt ». Côté base, `app_flags.sharing_enabled = false` et une politique refuse toute visibilité autre que `private`.
_Pourquoi_ : rassure sur le caractère privé tout en annonçant la suite. _Écartée_ : masquer complètement (plus simple, mais le champ paraîtrait sorti de nulle part plus tard).

### D-014 · Périmètre du hors ligne — Proposée

Lecture des envies en cache, capture express et modification des champs texte en file d'attente. Pas d'envoi d'image hors ligne, pas de Background Sync.

### D-015 · PWA avec Serwist, file avec Dexie — Proposée

### D-016 · Limitation de débit avec Upstash Ratelimit (UE) — Proposée

_Alternative_ : règles de pare-feu Vercel, à réévaluer si on veut éviter un fournisseur de plus.

### D-017 · Tailwind v4 et tokens sémantiques — Proposée

Variables CSS dans `tokens.css` (clair, sombre, `prefers-color-scheme`, réglage manuel via `data-theme`), exposées à Tailwind via `@theme`. Les composants n'utilisent que les noms sémantiques.

### D-018 · Icônes Lucide — Proposée

Trait de 1,75 px partout. _Écartée_ : Phosphor (très bien aussi, mais Lucide est déjà l'écosystème de shadcn).

### D-019 · Bottom sheets avec vaul — Proposée

### D-020 · Hébergement UE — Proposée

Supabase région Paris (`eu-west-3`) ou Francfort (`eu-central-1`) ; fonctions Vercel en `cdg1`. DPA signés avec les deux fournisseurs.

### D-021 · Complétude qualitative à trois niveaux — Proposée

`sketch` (Esquisse), `on_track` (Fiche en bonne voie), `well_filled` (Fiche bien remplie), calculée par une fonction pure partagée client / serveur à partir des sections renseignées. Stockée pour filtrer. Par envie, « Ne plus me le proposer » la retire de « Fiches à compléter ».
Règle initiale : _Esquisse_ = titre seul ou presque ; _En bonne voie_ = au moins 2 sections parmi Décrire, Pourquoi, Qualifier, Premières pistes ; _Bien remplie_ = au moins 4 sections dont Pourquoi. À ajuster après tests.

### D-022 · Catégories système + personnelles — Proposée

13 catégories système stockées par clé et traduites, masquables. Catégories personnelles avec libellé, icône et teinte choisies parmi les 12 teintes du design system.

### D-023 · Budget en euros par défaut — Proposée

`currency = 'EUR'`, modifiable plus tard dans le profil. Fourchette en centimes.

### D-024 · Corbeille de 30 jours — Proposée

« Mettre de côté » pose `deleted_at` ; un toast « Annuler » est proposé ; purge automatique après 30 jours (pg_cron). « Supprimer définitivement » est disponible depuis la corbeille. Distinct du statut « Lâché consciemment ».

### D-025 · Date cible avec précision — Proposée

`target_date` + `target_precision` (`day`, `month`, `season`, `year`) pour accepter « fin août » ou « au printemps » tout en gardant un tri possible. Le rythme (« deux fois par semaine ») se note dans la réponse T du SMART.

### D-026 · Polices auto-hébergées via `next/font` — Proposée

`next/font` télécharge les fichiers au build et les sert depuis notre domaine (pas d'appel à Google à l'exécution), sous-ensemble latin, `display: swap`.

### D-027 · Phrase SMART assemblée par gabarits — Proposée

Gabarits i18n déterministes qui combinent les réponses non vides (normalisation de la ponctuation et des majuscules). Aucune reformulation automatique. Si la personne retouche la phrase, on ne l'écrase plus.

### D-028 · Tests visuels dans l'image Docker Playwright officielle — Proposée

Captures stables (polices locales, animations coupées, dates figées), matrice mobile / desktop × clair / sombre.

---

### D-029 · Direction artistique A « Atelier » — Acceptée

Choix de la direction A : papier crème, accent terre cuite, Fraunces (titres) + Figtree (interface), ombres douces sans bordure en clair, bordures fines en sombre, rayon de carte 14 px, page de détail en papier pointillé. Les directions B et C restent documentées dans `design-system.md` pour mémoire.

### D-030 · Première envie avant le compte (session anonyme) — Acceptée

On peut écrire et garder une envie sans compte. Techniquement : `supabase.auth.signInAnonymously()` au premier « Garder », ce qui crée un vrai utilisateur `auth.users` (rôle `authenticated`, claim `is_anonymous = true`). La RLS est donc la même pour tout le monde.

- Juste après la première envie gardée, on propose de créer un compte (« Garder mon carnet sur tous mes appareils »), sans bloquer. La conversion se fait par `updateUser({ email })` ou `linkIdentity({ provider: 'google' })` : l'identifiant ne change pas, les envies restent.
- Limites pour un compte anonyme : pas d'images d'inspiration (stockage), pas d'export, 50 envies maximum (politique RLS), bandeau discret « Ton carnet n'est gardé que sur cet appareil ».
- Purge des comptes anonymes inactifs depuis 30 jours (pg_cron), annoncée dans le bandeau.
- La déclaration « 15 ans et plus » et l'acceptation de la politique de confidentialité se font sur l'écran de capture de la toute première envie (une ligne + case), puisque c'est là que des données sont stockées pour la première fois.
- Protection contre l'abus : CAPTCHA invisible Cloudflare Turnstile sur la création de session anonyme (recommandé par Supabase), limitation de débit.

### D-031 · Infrastructure préparée dans le dépôt — Acceptée

Dépôt : `Templeclub/goalist`. Je prépare toute la configuration dans le dépôt (`supabase/config.toml`, migrations, `vercel.json`, `.env.example`, CI) et un guide pas à pas (`docs/setup.md`). Créer les projets Supabase et Vercel et y coller les clés reste une action humaine (comptes, facturation) : le guide liste chaque clic et chaque variable.

---

## Phase 0

### D-032 · Cache Components et Partial Prefetching activés — Acceptée

Next.js 16.4 les active à la création du projet, et ils deviendront obligatoires à la version majeure suivante. On les garde dès maintenant plutôt que de migrer plus tard. Conséquence : toute lecture de session se fait dans un composant sous `<Suspense>` (squelette), ce qui correspond déjà au design system (pas de spinner plein écran).

### D-033 · Clés Supabase « publishable » et « secret » — Acceptée

Supabase a remplacé les clés `anon` / `service_role` par `sb_publishable_…` / `sb_secret_…`. Variables : `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` et `SUPABASE_SECRET_KEY` (serveur, module `src/server/admin` uniquement).

### D-034 · Banc de test de base de données sans Docker — Acceptée

`scripts/db-local/run.sh` applique les migrations sur un PostgreSQL local avec un schéma `auth` / `storage` simulé, lance la suite pgTAP et peut générer les types TypeScript. Sert quand Docker est indisponible (c'est le cas de l'environnement de développement actuel). La CI exécute la vraie pile Supabase et fait foi.

### D-035 · Proxy : locale puis session — Acceptée

`src/proxy.ts` enchaîne next-intl (réécriture vers `/[locale]` sans préfixe visible) puis le rafraîchissement de session Supabase. Ce dernier est sauté quand la requête ne porte aucun cookie de session : les pages publiques n'attendent jamais le réseau.

### D-036 · CSP de base maintenant, nonces en phase 5 — Acceptée

En-têtes de sécurité posés dès la phase 0 (CSP, HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'`). La CSP autorise encore les scripts en ligne (`'unsafe-inline'`) ; la phase 5 les remplace par des nonces par requête.

### D-037 · Service worker reporté à la phase 5 — Acceptée

Manifeste, icônes et couleurs de thème sont en place (installable). Le service worker (Serwist) et le hors ligne arrivent en phase 5, après vérification de sa compatibilité avec Turbopack, désormais utilisé pour le build.

### D-038 · Visibilité gérée par un drapeau côté base — Acceptée

`app_flags.sharing_enabled` ferme le partage. Les règles « cercle » et « communauté » existent déjà dans `goal_shared_with_me()` et sont testées (pgTAP) dans les deux états du drapeau.

## Phase 1

### D-039 · Données lues par les Server Components, écrites par les routes API — Acceptée

Lecture : `src/features/goals/queries.ts` (client serveur avec la session, RLS). Écriture : `POST /api/goals` (idempotent sur l'identifiant UUIDv7 du client), `PATCH /api/goals/:id` (patch par champ, renvoie `version`, `completenessLevel` et `conflict`), `PATCH /api/me`. La complétude est recalculée par le serveur à chaque patch.

### D-040 · Brouillon de capture et file de patchs en `localStorage` pour la phase 1 — Acceptée

Le texte de la capture non gardé et les patchs non envoyés sont conservés en `localStorage` (clés `elan:capture-draft`, `elan:pending:*`), ce qui suffit à survivre à un rechargement ou à une coupure. La phase 5 migre vers IndexedDB (Dexie) avec le service worker.

### D-041 · Déclarations enregistrées au premier geste — Acceptée

La phrase « 15 ans ou plus et politique de confidentialité » est affichée là où des données sont stockées pour la première fois : sous « Garder » à la toute première envie (session anonyme), et sur la page de connexion. `age_confirmed_at` et `privacy_accepted_at` sont posés côté serveur à ce moment-là, une seule fois.

### D-042 · Turnstile facultatif — Acceptée

Si `NEXT_PUBLIC_TURNSTILE_SITE_KEY` est défini, un jeton Turnstile accompagne la création de session anonyme ; sinon (développement, CI), elle se fait sans. La protection côté serveur est configurée dans Supabase (Attack Protection).

### D-043 · Navigation sous `<Suspense>` — Acceptée

Avec Cache Components, `usePathname()` est une donnée de requête sur les routes dynamiques. Les barres de navigation s'affichent d'abord sans élément actif, puis le marquent dès que le chemin est connu. La page détail d'une envie est entièrement rendue derrière un squelette.

### D-044 · Tests E2E avec backend en CI seulement (pour l'instant) — Acceptée

Les parcours qui créent des envies (`e2e/capture.spec.ts`) tournent en CI sur une pile Supabase locale (`E2E_SUPABASE=1`). Ils ne visent jamais le projet hébergé, pour ne pas y créer de comptes de test.

## Phase 2

### D-045 · Une section par écran, sur mobile comme sur desktop — Acceptée

Le parcours vit sous `/goals/:id/edit/:section`. Sur desktop, le sommaire collant (à gauche) et l'aperçu en direct de la carte (à droite) entourent la section en cours, plutôt qu'une longue colonne : une idée à la fois, URL partageable, et « Continuer » marque un vrai moment pour l'instantané d'historique. Les sections SMART et Qualifier s'insèreront en phase 3.

### D-046 · Le schéma du texte riche est testé contre la sortie réelle de Tiptap — Acceptée

`editor-extensions.ts` est partagé entre l'éditeur et un test qui vérifie que tout ce que Tiptap produit est accepté par `RichDoc` (validation serveur), et que ce qui est interdit (titres de niveau 1, citations, code, liens `javascript:`) est filtré avant l'envoi.

### D-047 · Historique : un instantané au plus toutes les deux minutes en sortie de section — Acceptée

Le serveur construit l'instantané lui-même (le client n'envoie que la raison). Restaurer crée d'abord un instantané `restore` de l'état courant et efface les patchs locaux en attente, pour qu'ils ne réécrasent pas la version restaurée.

### D-048 · Images d'inspiration réservées aux carnets avec compte — Acceptée

Conformément à D-030 et aux politiques Storage, une session anonyme peut ajouter des liens mais pas d'images. Les images sont réencodées en WebP (2000 px max) dans le navigateur avant l'envoi, puis servies par URL signée d'une heure. L'éditeur de description et les médias se sauvegardent indépendamment (patch du texte, `PUT /values`, `POST /media`).

### D-049 · Pages gardées en mémoire par Next (React Activity) — Acceptée

Avec Cache Components, Next garde jusqu'à 3 pages visitées dans le DOM, cachées. Le formulaire de la fiche est donc indexé sur la version de l'envie (`key` incluant `version`) : après une restauration ou une modification faite ailleurs, il est remonté avec les données à jour au lieu de réafficher (et de réenregistrer) un état périmé. Les tests E2E ne regardent que la page visible.

## Phase 3

### D-050 · SMART dans le parcours, en cinq étapes internes — Acceptée

L'assistant est la section 4 du parcours (`/edit/smart`), une question à la fois avec une barre S·M·A·R·T cliquable. Les réponses vont dans `smart_answers` (`PATCH /api/goals/:id/smart`, upsert). La phrase est réassemblée côté client à chaque réponse tant que la personne ne l'a pas modifiée (`assembled_edited`), par des gabarits du catalogue de messages : aucune reformulation automatique.

### D-051 · Catégories, tags et mot de statut comme sous-ressources — Acceptée

`PUT /api/goals/:id/categories` (ordre conservé : la première donne la teinte du signet), `PUT /api/goals/:id/tags` (les nouveaux libellés deviennent des tags personnels), `POST /api/categories` (catégorie personnelle : nom + l'une des 12 teintes), `PATCH /api/goals/:id/status-note` (mot facultatif sur le dernier changement de statut). Tags et noms de catégories alimentent `search_extra` pour la recherche de la phase 4. La complétude compte désormais les catégories et les critères SMART.

## Phase 4

### D-052 · L'état de la liste vit dans l'URL — Acceptée

Recherche, filtres rapides, filtres combinables, tri, regroupement et envie ouverte sont des paramètres d'URL (`/goals?q=&quick=&status=&sort=&group=&open=`), validés par Zod (`list-query.ts`) puis traduits en requête PostgREST côté serveur. Retour arrière, rechargement et partage conservent la vue. La recherche combine le plein texte français sans accents (`search_vector`, `fr_unaccent`) et une sous-chaîne du titre ; les caractères de la syntaxe PostgREST sont neutralisés.

### D-053 · Master-detail par paramètre plutôt que par layout — Acceptée

Sur ordinateur, `/goals?open=:id` affiche la page de l'envie à droite de la liste (même composant `GoalNotebook` que `/goals/:id`). Un layout ne reçoit pas les `searchParams`, d'où ce choix ; sur mobile, les cartes restent de simples liens vers `/goals/:id`, interceptés seulement à partir de 1024 px.

### D-054 · « Fiches à compléter » = un filtre rapide — Acceptée

La zone est le filtre `quick=to_complete` (envies à l'état d'esquisse, non écartées). « Ne plus me le proposer » pose `completion_dismissed_at` via le patch habituel (`completion_dismissed: true`) ; l'envie reste dans le carnet.

## Phase 5

### D-055 · Export ZIP et suppression en libre-service — Acceptée

`GET /api/export` lit tout via RLS (jamais la clé secrète) et produit un ZIP (fflate, en mémoire) : `elan-export.json` complet, une page Markdown par envie (libellés traduits), les images originales. Réservé aux comptes : une session anonyme n'a rien à récupérer ailleurs que sur son appareil. `DELETE /api/account` exige `{ confirm: "supprimer" }`, supprime les fichiers Storage du préfixe `<userId>/` puis l'utilisateur Auth (`src/server/admin/delete-account.ts`) ; toutes les tables suivent par `ON DELETE CASCADE`. Si les fichiers ne peuvent pas être listés, rien n'est supprimé.

### D-056 · Hors ligne minimal, sans Serwist pour l'instant — Acceptée

Un service worker écrit à la main (`public/sw.js`, ~80 lignes) suffit au périmètre : pages en réseau d'abord puis cache, puis `/offline` ; ressources statiques en cache d'abord ; `/api` jamais mis en cache. Les captures express faites hors ligne (avec une session déjà ouverte) sont gardées dans `localStorage` et rejouées au retour du réseau, avec leur UUID client, donc sans doublon. La file de patchs Dexie et l'édition complète hors ligne restent pour plus tard ; Serwist sera repris si la stratégie de cache se complique.

### D-057 · CSP : `'unsafe-inline'` conservé pour les scripts — Acceptée

Les nonces imposent un rendu dynamique de chaque page, incompatible avec le pré-rendu partiel (Cache Components). L'option expérimentale `sri` de Next a été essayée : sans `'unsafe-inline'`, les scripts inline de streaming RSC sont bloqués (12 violations, hydratation cassée). On garde donc `script-src 'self' 'unsafe-inline'` + Turnstile, avec `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'` et des sources de connexion limitées à Supabase. À revoir quand Next proposera des hachages compatibles PPR.

### D-058 · Budgets Lighthouse — Acceptée

La CI vérifie Lighthouse en préréglage ordinateur sur les pages publiques et `/home` (performance ≥ 0,9, accessibilité ≥ 0,95, bonnes pratiques ≥ 0,9 ; scores mesurés 96–100). En mobile simulé (4G lente), `/`, `/welcome` et `/privacy` dépassent 90 ; `/home` et `/sign-in` sont à 84–85 parce que le modèle de simulation attribue au JavaScript l'affichage du contenu reçu en streaming, alors que la trace réelle montre le LCP à 0,4–0,7 s. Le client Supabase et la feuille de capture sont chargés à la demande pour alléger le premier rendu. Plausible et Sentry ne sont pas encore branchés : ils demandent des comptes et un réglage sans contenu utilisateur, à faire avec la mise en production.

## Simplification (retours d'usage)

### D-059 · Emoji et catégorie devinés d'après le titre, sans IA — Acceptée

À la création, `classifyTitle` (`src/features/goals/auto-classify.ts`) cherche des débuts de mots dans le titre (sans accents ni majuscules) dans une liste écrite à la main : « courir » → 🏃 Sport & santé, « guitare » → 🎸 Créatif… Sinon ✨ et aucune catégorie. C'est une table de correspondance déterministe, locale et testée, pas un modèle : la règle « aucune IA » (CLAUDE.md) est précisée en ce sens. Tout reste modifiable dans la section « L'envie ».

### D-060 · Parcours en 4 sections au lieu de 7 — Acceptée

Retours d'usage : trop d'étapes, trop de redites (titre / accroche, pourquoi / R, horizon / temps estimé / date cible…). Le parcours devient L'envie (titre, emoji, catégorie, description), Le pourquoi (texte + valeurs), Préciser (A : ce qu'il faut, préparation, budget ; T : horizon, saison), Premier pas (étape + statut). La couleur vient de la catégorie. Les colonnes devenues inutiles restent en base (aucune migration destructive) : les données existantes sont conservées, affichées si présentes et exportées. La complétude compte 4 parties ; les anciennes valeurs de `missing_sections` sont simplement ignorées jusqu'à la prochaine modification de l'envie.

### D-061 · Liste en grille, triée pour aider à choisir — Acceptée

Cartes compactes en grille (2 colonnes sur mobile, jusqu'à 5 sur grand écran), avec catégorie, horizon et « À anticiper » (préparation lourde pour une envie encore devant soi). Par défaut : regroupement par horizon et tri « À l'horizon » (horizon proche, puis préparation lourde, puis le reste). Aucun score n'est affiché : c'est un ordre, pas une note. Le master-detail (D-053) est retiré : il empêchait d'afficher plusieurs cartes par ligne. Les filtres difficulté et énergie disparaissent avec leurs champs.
