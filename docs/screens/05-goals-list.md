# Écran 5 (version phase 1) — Mes envies

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
