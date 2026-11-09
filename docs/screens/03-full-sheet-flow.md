# Écran 3 — Parcours « Donner vie à cette envie »

**Rôle** : nommer, motiver et situer une envie en quelques minutes, sans jamais être bloqué. Le but reste de noter ses envies et de les situer clairement, pas de remplir un dossier (D-060).

## Structure

4 sections : 1 L'envie · 2 Le pourquoi · 3 Préciser · 4 Premier pas. URL : `/goals/:id/edit/:section` (`name`, `why`, `smart`, `first-steps`). Les anciennes adresses `describe`, `qualify` et `review` redirigent vers `name`, `smart` et `first-steps`.

## Mobile : une idée par écran

1. **Barre haute** : fermer (×, retour au détail), titre de l'envie tronqué, `SaveIndicator` (« Enregistré »), historique.
2. **Progression** : 4 segments fins ; sous les segments « Préciser · 3 sur 4 ».
3. **Question** en serif `text-xl`, bouton « ? » qui ouvre l'aide (explication + exemple avant → après).
4. **Champs** de la section.
5. **Pied fixe** : « Passer pour l'instant » (discret) · « Continuer » (primaire). Dernière section : « Garder et revenir à la page ».

## Desktop : trois zones

Sommaire collant à gauche (les 4 sections avec leur état), formulaire au centre (640 px max), aperçu en direct à droite (`GoalCard` + `CompletenessMeter`).

## Détail des sections

| #             | Contenu                                                                                                                          | Contrôles                                                                                |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1 L'envie     | Titre ; emoji (deviné d'après le titre, modifiable) ; catégorie(s) ; description facultative                                     | champ serif, champ emoji, `ChipGroup` multiple + « Créer une catégorie », Tiptap minimal |
| 2 Le pourquoi | « Pourquoi c'est important pour toi ? » (tient aussi lieu de R du SMART) ; ce que ça apporterait                                 | une zone de texte + `ChipGroup` multiple de valeurs                                      |
| 3 Préciser    | **Ce qu'il faut** (A du SMART) : « Qu'est-ce qui rend ça possible ? », préparation, budget. **Pour quand** (T) : horizon, saison | zone de texte, `StepSelector` 5 crans, chips budget, chips horizon, chips des 4 saisons  |
| 4 Premier pas | La toute première petite étape ; où en est l'envie (statut) ; un mot si on la laisse partir                                      | champ mis en valeur, `ChipGroup` simple des statuts, zone de texte                       |

Le S du SMART est le titre ; le M n'est plus demandé (c'était une reformulation). La couleur du signet vient de la première catégorie : plus de choix de teinte par envie.

Retirés du parcours (les données déjà saisies restent visibles sur la page de l'envie et dans l'export) : accroche, couleur, « À quoi ça ressemblerait », « Où, avec qui », images et liens, « Autre chose ? », questions S, M, R et phrase SMART, obstacle et « si… alors », difficulté, date cible, énergie, temps estimé, mode, lieu, tags, notes, visibilité.

## Création

À la capture express, l'emoji et, si un mot-clé le permet, la catégorie sont devinés d'après le titre par un dictionnaire écrit à la main (`features/goals/auto-classify.ts`, D-059). Rien n'est envoyé à un service externe ; tout reste modifiable dans la section 1.

## Complétude

Quatre parties comptent (D-060) : l'envie (catégorie ou description), le pourquoi, préciser (au moins un élément), le premier pas. Esquisse : moins de 2 ; en bonne voie : 2 ; bien remplie : 3 dont le pourquoi.

## Accessibilité

Chaque groupe de choix est un `fieldset` avec `legend` ; la progression est annoncée (« Préciser, 3 sur 4 ») ; aucun champ n'est obligatoire hormis le titre, qui garde toujours sa dernière valeur non vide.
