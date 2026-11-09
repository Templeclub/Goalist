# Écran 1 — Accueil

**Rôle** : donner envie d'écrire, en un geste. Retrouver ses dernières envies sans effort.

## Hiérarchie (mobile)

1. **En-tête** : date du jour (`text-sm`, `ink-3`), salutation selon l'heure en serif `text-2xl` (« Bonjour, Camille » / « Bonsoir, Camille »), avatar à droite (vers « Moi »).
2. **Geste principal** : grand champ-bouton « J'aimerais… » (hauteur 64 px, fond `card`, police de titrage, icône « + » dans un cercle accent). Il ouvre la capture express.
3. **Tes dernières envies** : 3 cartes `GoalCard` (taille large), lien discret « Tout voir ».
4. **Fiches à compléter** : bloc doux (fond `paper-2`, sans bordure), phrase « Deux envies attendent un peu d'attention, quand tu veux. », puis 2 lignes (emoji, titre, ce qui pourrait être ajouté) avec bouton « Compléter ». Lien « Voir tout ».
5. **Navigation basse** : Accueil · Mes envies · « + » · Moi.

## Desktop

Rail de navigation à gauche. Colonne centrale de 720 px max : salutation, champ « J'aimerais… » (raccourci `N` affiché), dernières envies en grille de 3, « Fiches à compléter » en colonne latérale droite.

## États

- **Aucune envie** : illustration au trait (un carnet ouvert et une plume), « Ton carnet est prêt. Une envie, même petite, suffit pour commencer. », 3 exemples à tapoter (« Dormir une nuit à la belle étoile », « Apprendre à faire son pain », « Écrire à une vieille amie ») qui préremplissent la capture.
- **Rien à compléter** : le bloc disparaît, sans message.
- **Chargement** : squelettes de cartes.
- **Hors ligne** : bandeau discret sous l'en-tête « Hors ligne. Tu peux continuer d'écrire. »

## Micro-copies

`home.greeting.morning` Bonjour, {name} · `home.greeting.evening` Bonsoir, {name} · `home.capture.cta` J'aimerais… · `home.recent.title` Tes dernières envies · `home.recent.seeAll` Tout voir · `home.toComplete.title` Fiches à compléter · `home.toComplete.intro` {count, plural, one {Une envie attend} other {# envies attendent}} un peu d'attention, quand tu veux. · `home.toComplete.action` Compléter

## Version collection de cartes (D-062)

Remplace les points 3 à 5.

3. **À convertir bientôt** : cartes compactes en rangée défilante sur mobile (grille sur ordinateur) : horizon « Bientôt » ou carte déjà commencée, celles qui ont un premier pas d'abord, puis l'ordre « À l'horizon ». Sans carte éligible : une phrase qui explique comment en faire apparaître une. Lien « Toutes mes cartes ».
4. **À préparer dès maintenant** : cartes à préparation importante dont l'horizon est moyen ou long (« À anticiper »).
5. **Dernière carte acquise** : la carte holographique, avec son numéro, et un lien « Ma collection ».
6. **Cartes à révéler** : les esquisses (bloc contouré), avec « Révéler ».
7. **Navigation basse** : Accueil · Mes cartes · « + » · Collection · Moi.

Toutes les règles sont déterministes (`homeRecommendations`) : aucune suggestion générée.

## Version allégée (D-063)

1. Salutation, capture.
2. **À convertir bientôt** (ou « Tes dernières cartes » si aucune n'est proche) en **éventail** : cartes légèrement inclinées et superposées, qui se redressent au survol ou au focus ; défilement horizontal.
3. **Et aussi** : un panneau de lignes-liens — « N cartes à préparer dès maintenant », « N cartes à révéler », « Dernière acquise : … (n° …) ».
