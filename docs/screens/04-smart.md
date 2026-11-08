# Écran 4 — Préciser (assistant SMART guidé, sans IA)

**Rôle** : rendre une envie plus claire, une question à la fois. Tout est facultatif.

Route : `/goals/:id/edit/smart` (section 4 du parcours). Cinq étapes internes à l'écran, avec « Précédent » et « Suivant ».

| Lettre          | Question                                                                                  | Exemple avant → après                                                                      |
| --------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| S — Spécifique  | Que veux-tu accomplir précisément ? Qui, quoi, où ?                                       | « Faire du sport » → « Courir 5 km d'affilée dans mon quartier »                           |
| M — Mesurable   | À quoi verras-tu que c'est réussi ?                                                       | « Être en forme » → « Courir 5 km sans m'arrêter, même lentement »                         |
| A — Atteignable | Qu'est-ce qui rend ça réaliste pour toi ? + « Le principal obstacle » + « Si… alors je… » | « Je verrai bien » → « Si il pleut, alors je cours sur le tapis de la salle »              |
| R — Pertinent   | En quoi cela compte-t-il pour toi ?                                                       | « C'est bien pour la santé » → « Je veux retrouver le plaisir de bouger avec mes enfants » |
| T — Temporel    | Pour quand, ou à quel rythme ? (date facultative)                                         | « Un jour » → « D'ici fin juin, trois sorties par semaine »                                |

## Après la 5ᵉ étape

- **Phrase assemblée** à partir des réponses (gabarits écrits à la main, D-027), dans une zone éditable, avec « Copier ».
- Repère : « {n} critères sur 5 renseignés. C'est un repère, pas une note. »
- Si la personne a modifié la phrase, on ne l'écrase plus ; bouton « Réassembler à partir de mes réponses ».

## Règles

- Une barre de 5 points montre l'étape, sans couleur d'alerte. On peut sauter n'importe quelle étape.
- Sauvegarde automatique de chaque réponse (`PATCH /api/goals/:id/smart`).
