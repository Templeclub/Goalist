# Écran 10 — Ma collection

**Rôle** : retrouver les envies réalisées comme des cartes acquises, et en être fier sans être noté (D-062).

Route : `/collection`.

## Hiérarchie

1. Titre « Ma collection » et compteur (« 7 cartes acquises » ; « Aucune carte acquise pour l'instant »).
2. **Séries** : une pastille par série représentée (couleur, nom, nombre de cartes), triées par nombre. Pas de total à atteindre, pas de pourcentage.
3. **Classeur** : grille contourée (2 colonnes sur mobile, jusqu'à 5) des cartes acquises, la plus récente d'abord, chacune holographique avec « Acquise ! », son numéro (rang d'acquisition, « n° 007 ») et sa date. Une case en pointillés « La prochaine carte arrivera ici » termine la grille.
4. **Cartes rangées** (repliées) : « 2 cartes rangées », « Mises de côté, jamais perdues. Ouvre-en une pour la ressortir. »

## États

- **Vide** : bloc en pointillés « Ta première carte t'attend » + lien vers « Mes cartes ».
- **Chargement** : 4 squelettes de carte.

## Accessibilité

Chaque carte est un `article` dont le titre est un lien ; la rareté a un nom accessible (« Rareté : Rare ») ; l'animation holographique s'arrête sous `prefers-reduced-motion`.
