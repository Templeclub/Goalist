# Écran 5 — Mes envies

**Rôle** : retrouver toutes ses envies, les plus récentes d'abord. La recherche, les filtres et le master-detail arrivent en phase 4.

Route : `/goals`.

## Hiérarchie

1. Titre serif `text-2xl` « Mes envies » et compteur discret (« 12 envies »), sans objectif chiffré.
2. Liste de `GoalCard` compactes, triées par dernière modification, une colonne sur mobile, deux à partir de 768 px.
3. Chaque carte mène au détail.

## États

- **Chargement** : 4 squelettes de carte.
- **Aucune envie** : `EmptyState` du carnet vide (illustration, « Ton carnet est prêt. », 3 exemples qui ouvrent la capture préremplie).
- **Sans session** : même état vide (aucune donnée n'existe encore).

## Version phase 4 — Consulter & retrouver

L'état de la liste vit dans l'URL (`/goals?q=…&status=…&quick=…&sort=…&group=…&open=…`) : on peut revenir en arrière, recharger ou partager sa vue.

1. **Recherche** plein texte en haut (raccourci `/` partout dans l'app) : titre, accroche, tags, catégories, description, pourquoi, première étape. Sans accents ni majuscules (« reve » trouve « Rêve »).
2. **Filtres rapides**, chips à bascule sous la recherche : « Ce week-end » (temps court ou contexte week-end), « Peu d'énergie », « Sans budget », « Facile à lancer » (difficulté facile/à ma portée ou préparation légère), « À compléter ».
3. Bouton **Filtres** (avec le nombre de filtres actifs) qui ouvre une bottom sheet : statut, catégorie, difficulté, préparation, horizon, énergie, budget — tous combinables, choix multiples ; « Tout effacer ».
4. **Trier** : modifiées récemment (défaut), gardées récemment, titre A→Z, date cible la plus proche, plus faciles d'abord. **Regrouper** : aucun, par statut, par horizon, par catégorie.
5. Résultats : compteur discret (« 4 envies »), cartes compactes ; groupes avec un titre de section.
6. **Desktop (≥ 1024 px)** : master-detail. La liste reste à gauche (420 px), la page de l'envie s'ouvre à droite (`open=`) ; sur mobile, la carte mène à la page de l'envie.

## États

- Aucun résultat : « Rien ne correspond à ces filtres. » + « Tout effacer ». Jamais de culpabilisation.
- Carnet vide : état vide habituel.

## Fiches à compléter

Filtre rapide « À compléter » (envies à l'état d'esquisse, non écartées). Sur chaque carte de l'accueil et de ce filtre : « Ne plus me le proposer » (l'envie reste dans le carnet, elle sort seulement de cette zone ; réversible depuis la fiche, section Relire).

## Version simplifiée — prioriser d'un coup d'œil (D-061)

Remplace les points 2 à 6 de la version phase 4.

1. **Cartes en grille** pleine largeur : 2 par ligne sur mobile, 3 à partir de 768 px, 4 à partir de 1024 px, 5 sur très grand écran. Le master-detail est retiré : une carte mène à la page de l'envie.
2. **Carte compacte** : emoji (sinon celui de la catégorie), titre (4 lignes au plus), pastille de catégorie (icône + nom), horizon court (« Bientôt », « Cette année », « Plus tard », « Un jour ») et, si la préparation est importante ou très importante pour une envie encore devant soi, la pastille « À anticiper ». Le statut n'apparaît que s'il n'est pas « Idée ».
3. **Par défaut** : regroupement par horizon (du plus proche à « Un jour », puis « Horizon non précisé ») et tri « À l'horizon » : horizon le plus proche, puis préparation la plus lourde, les envies réalisées ou laissées partir en dernier.
4. **Filtres rapides** : « Bientôt », « À anticiper », « Sans budget », « À compléter ».
5. **Filtres** : statut, catégorie, préparation, horizon, budget. **Tris** : à l'horizon, modifiées récemment, gardées récemment, titre A→Z. **Regrouper** : par horizon (défaut), aucun, par statut, par catégorie.
