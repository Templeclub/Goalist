# Écran 9 — Historique d'une envie

**Rôle** : se rassurer (rien n'est perdu) et revenir à une version antérieure si on le souhaite.

Route : `/goals/:id/history`, depuis la barre du parcours (« Historique ») et le pied de la page de détail.

## Hiérarchie

1. Retour vers la fiche.
2. Titre serif « Historique ».
3. Liste chronologique inversée des instantanés : date et heure relatives (« il y a 5 minutes »), raison en mots (« En quittant Décrire », « En relisant », « Version restaurée »), titre et accroche de l'époque.
4. Sur chaque ligne : « Revenir à cette version ». Une confirmation douce dans la ligne même : « La version actuelle est gardée dans l'historique. » + « Revenir » / « Annuler ».

## Règles

- Restaurer ne supprime rien : l'état actuel devient d'abord un instantané `restore`.
- 50 instantanés conservés par envie ; les plus anciens disparaissent sans prévenir (c'est un filet, pas une archive).
- État vide : « Pas encore d'historique. Il se remplit au fil des sections que tu complètes. »
