# Écran 0 — Onboarding (3 écrans)

**Rôle** : dire en trois phrases ce qu'est le carnet, puis laisser écrire. Passable à tout moment, jamais réaffiché une fois terminé ou passé.

Route : `/welcome`. Le bouton « Commencer mon carnet » de la page publique y mène. Une fois terminé ou passé, on arrive sur `/home` (le souvenir est gardé sur l'appareil, puis dans `profiles.onboarding_completed_at` dès qu'une session existe).

## Hiérarchie (mobile, un écran à la fois)

1. Barre haute : « Passer » (bouton discret, à droite).
2. Illustration au trait (carnet ouvert, puis plume, puis signet).
3. Titre serif `text-2xl`, une phrase de corps `text-md`.
4. Trois points de progression (purement indicatifs, `aria-hidden`), texte « 1 sur 3 » pour les lecteurs d'écran.
5. Bouton primaire en bas : « Continuer », puis « Écrire ma première envie » au dernier écran.

## Textes

| #   | Titre                          | Corps                                                                                   |
| --- | ------------------------------ | --------------------------------------------------------------------------------------- |
| 1   | Un carnet pour tes envies      | Les petites, les grandes, celles d'un jour. Les écrire, c'est déjà commencer.           |
| 2   | Écris d'abord, précise ensuite | Une phrase suffit pour garder une envie. Tu lui donneras forme plus tard, à ton rythme. |
| 3   | Rien ne presse                 | Pas de score, pas de rappel insistant, pas de comparaison. Ton carnet est privé.        |

## Desktop

Carte centrée de 560 px sur fond pointillé ; mêmes contenus, flèches clavier ← → pour naviguer.

## Accessibilité

Région `aria-live="polite"` annonçant le titre de chaque étape ; focus déplacé sur le titre à chaque changement ; animation de glissement coupée en mouvement réduit.
