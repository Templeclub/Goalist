# Écran 2 — Capture express

**Rôle** : garder une envie en moins de 10 secondes, avec le titre seul.

## Déclenchement
« + » de la barre basse, champ « J'aimerais… » de l'accueil, touche `N` sur desktop, exemple tapoté dans un état vide.

## Hiérarchie (sheet plein écran sur mobile, modale centrée de 560 px sur desktop)
1. Poignée + bouton fermer (×) à gauche, aucun titre lourd.
2. Libellé discret : « Une envie, en une phrase ».
3. **Champ unique** en serif `text-xl`, clavier ouvert d'emblée, placeholder « J'aimerais… », 120 caractères max (compteur affiché seulement après 100).
4. Aide sous le champ (`text-sm`, `ink-3`) : « Seul le titre compte pour l'instant. Tu pourras tout préciser plus tard. »
5. Si le champ est vide : 3 exemples en chips pour s'inspirer (disparaissent dès la première lettre).
6. **Bouton « Garder »** pleine largeur, collé au-dessus du clavier, désactivé tant que le champ est vide (sans message d'erreur).

## Après « Garder »
- Haptique légère, la sheet se referme, la carte apparaît en tête des dernières envies avec un léger rebond.
- Toast en bas : « Envie gardée. » (ou, la toute première fois : « Ta première envie est écrite. C'est souvent le pas le plus difficile. ») + « Compléter la fiche maintenant ? » · **Oui** · **Plus tard**.
- « Oui » ouvre le parcours à la section 1. « Plus tard » ferme le toast et affiche brièvement « Elle t'attend dans Fiches à compléter. »
- `Entrée` garde, `Esc` ferme (le texte non gardé est conservé localement et revient à la prochaine ouverture).

## États
- **Hors ligne** : identique, le toast dit « Envie gardée sur cet appareil. Elle sera envoyée dès le retour du réseau. »
- **Texte « J'aimerais » conservé** : si la personne garde « J'aimerais apprendre le violoncelle », on propose une fois, dans le parcours, de raccourcir en « Apprendre le violoncelle » (suggestion par règle simple, pas d'IA ; jamais automatique).

## Micro-copies
`capture.express.label` Une envie, en une phrase · `capture.express.placeholder` J'aimerais… · `capture.express.hint` Seul le titre compte pour l'instant. Tu pourras tout préciser plus tard. · `capture.express.submit` Garder · `capture.saved.first` Ta première envie est écrite. C'est souvent le pas le plus difficile. · `capture.saved.default` Envie gardée. · `capture.saved.offer` Compléter la fiche maintenant ? · `common.yes` Oui · `common.later` Plus tard
