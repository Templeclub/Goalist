# Journal des décisions

Format court : contexte, décision, alternatives écartées. Chaque décision peut être rediscutée ; on ajoute alors une nouvelle entrée qui remplace l'ancienne plutôt que de réécrire l'histoire.

Statuts : **Proposée** · **Acceptée** · **Remplacée**.

> 8 novembre 2026 : feu vert reçu. Les décisions D-001 à D-028 sont appliquées par défaut à partir de la phase 0 (aucune objection). D-029 à D-031 tranchent les trois questions bloquantes du plan.

---

### D-001 · Nom du produit centralisé — Proposée
`APP_NAME = "Élan"` dans `src/config/app.ts`, injecté dans les messages via `{appName}`. Le manifeste PWA, les métadonnées et les e-mails le lisent au même endroit.

### D-002 · Supabase sans ORM — Proposée
Migrations SQL via la CLI Supabase, types générés par `supabase gen types`, accès aux données par `supabase-js` avec la session utilisateur.
*Pourquoi* : la RLS est la frontière de sécurité. Drizzle ou Prisma en connexion directe utilisent un rôle qui contourne la RLS, sauf à reconstruire le contexte JWT à chaque transaction. Les politiques, triggers et la config de recherche française s'écrivent de toute façon en SQL.
*Écartées* : Drizzle (bon outil, mais deux sources de vérité pour le schéma et risque de contournement), Prisma (même risque, client plus lourd).

### D-003 · Route Handlers pour les écritures rejouables — Proposée
Les patchs de la sauvegarde auto passent par `PATCH /api/goals/:id`, pas par des Server Actions.
*Pourquoi* : les identifiants de Server Actions changent à chaque déploiement, ce qui casse le rejeu d'une file hors ligne. Server Actions autorisées pour les formulaires non rejouables (réglages).

### D-004 · Identifiants UUIDv7 générés côté client — Proposée
Pour `goals` (et médias). Création idempotente hors ligne, tri chronologique naturel.

### D-005 · Sauvegarde par patch de champ — Proposée
Debounce de 700 ms, patch `{ field, value, baseVersion, clientMutationId }`, la dernière écriture gagne par champ, l'ancienne valeur reste dans l'historique. Indicateur « Enregistrement… » seulement après 400 ms.

### D-006 · Pas de table `drafts` — Proposée
L'envie est son propre brouillon dès « Garder ». Seul le texte de la capture express non gardé est conservé localement (IndexedDB) si l'app se ferme.
*Écartée* : une table `drafts` côté serveur, qui ferait doublon avec `goals` et compliquerait la synchronisation.

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
*Pourquoi* : rassure sur le caractère privé tout en annonçant la suite. *Écartée* : masquer complètement (plus simple, mais le champ paraîtrait sorti de nulle part plus tard).

### D-014 · Périmètre du hors ligne — Proposée
Lecture des envies en cache, capture express et modification des champs texte en file d'attente. Pas d'envoi d'image hors ligne, pas de Background Sync.

### D-015 · PWA avec Serwist, file avec Dexie — Proposée

### D-016 · Limitation de débit avec Upstash Ratelimit (UE) — Proposée
*Alternative* : règles de pare-feu Vercel, à réévaluer si on veut éviter un fournisseur de plus.

### D-017 · Tailwind v4 et tokens sémantiques — Proposée
Variables CSS dans `tokens.css` (clair, sombre, `prefers-color-scheme`, réglage manuel via `data-theme`), exposées à Tailwind via `@theme`. Les composants n'utilisent que les noms sémantiques.

### D-018 · Icônes Lucide — Proposée
Trait de 1,75 px partout. *Écartée* : Phosphor (très bien aussi, mais Lucide est déjà l'écosystème de shadcn).

### D-019 · Bottom sheets avec vaul — Proposée

### D-020 · Hébergement UE — Proposée
Supabase région Paris (`eu-west-3`) ou Francfort (`eu-central-1`) ; fonctions Vercel en `cdg1`. DPA signés avec les deux fournisseurs.

### D-021 · Complétude qualitative à trois niveaux — Proposée
`sketch` (Esquisse), `on_track` (Fiche en bonne voie), `well_filled` (Fiche bien remplie), calculée par une fonction pure partagée client / serveur à partir des sections renseignées. Stockée pour filtrer. Par envie, « Ne plus me le proposer » la retire de « Fiches à compléter ».
Règle initiale : *Esquisse* = titre seul ou presque ; *En bonne voie* = au moins 2 sections parmi Décrire, Pourquoi, Qualifier, Premières pistes ; *Bien remplie* = au moins 4 sections dont Pourquoi. À ajuster après tests.

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
