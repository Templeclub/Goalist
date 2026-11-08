# Écran 3 — Parcours « Donner vie à cette envie »

**Rôle** : décrire, préciser et qualifier une envie, section par section, sans jamais être bloqué.

## Structure

7 sections : 1 Nommer · 2 Décrire · 3 Le pourquoi · 4 Préciser (SMART) · 5 Qualifier · 6 Premières pistes · 7 Relire & garder. URL : `/goals/:id/edit/:section`.

## Mobile : une idée par écran

1. **Barre haute** : fermer (×, retour au détail), titre de l'envie tronqué, `SaveIndicator` (« Enregistré »), annuler / rétablir.
2. **Progression** : 7 segments fins. Fait = accent plein, en cours = accent, passé = trait pointillé, vide = `line`. Sous les segments : « Le pourquoi · 3 sur 7 ». Tap sur la progression = sommaire en sheet.
3. **Question** en serif `text-xl`, bouton « ? » (44 px) qui ouvre le `HelpDrawer` (explication + exemple avant → après).
4. **Champs** de la section (un à trois maximum par écran, sinon on découpe).
5. **Pied fixe** : « Passer pour l'instant » (discret) · « Continuer » (primaire). `CompletenessMeter` juste au-dessus, en une ligne.

## Desktop : trois zones

- **Sommaire collant** à gauche (240 px) : les 7 sections avec leur état, clic pour y aller.
- **Formulaire** au centre (640 px max) : toutes les sections à la suite, la section active mise en valeur au défilement.
- **Aperçu en direct** à droite (340 px) : la `GoalCard` telle qu'elle apparaîtra, le `CompletenessMeter`, et les raccourcis.

## Détail des sections

| #                  | Contenu                                                                                               | Contrôles                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 1 Nommer           | Titre, emoji ou couleur, accroche en une phrase                                                       | champ texte serif, sélecteur d'emoji, 12 pastilles de teinte                                       |
| 2 Décrire          | Description riche, « À quoi ça ressemblerait si c'était fait ? », « Où / avec qui ? », images, liens  | Tiptap minimal + chips de relance, zones de texte, ajout d'image (avec texte alternatif)           |
| 3 Le pourquoi      | « Pourquoi c'est important pour moi ? », « Qu'est-ce que ça m'apporterait ? »                         | zone de texte + `ChipGroup` multiple de valeurs (+ « Autre… »)                                     |
| 4 Préciser         | Entrée vers l'assistant SMART (5 écrans) ou résumé s'il est rempli                                    | carte « Rendre cette envie plus claire »                                                           |
| 5 Qualifier        | Catégories, difficulté, préparation, horizon + date, énergie, budget, temps, mode, saison, lieu, tags | chips, `StepSelector`, `IconRadioCard`, découpé en 2 écrans sur mobile                             |
| 6 Premières pistes | « Quelle serait la toute première petite étape ? » (≤ 15 min), notes                                  | un champ court mis en valeur, zone de notes                                                        |
| 7 Relire & garder  | Aperçu de la page, statut, visibilité                                                                 | `GoalCard` large, `ChipGroup` de statut, sélecteur de visibilité (Privé actif, autres « Bientôt ») |

## Règles

- Sauvegarde continue ; quitter à tout moment est sans conséquence. Pas de « Es-tu sûr ? ».
- « Passer pour l'instant » marque la section comme passée (pointillé), jamais comme manquante.
- Questions de relance sous la description : « Qu'est-ce qui te donne envie là-dedans ? », « Qu'est-ce qui serait différent après ? », « Qui aimerais-tu y associer ? ». Un tap insère la question comme titre de paragraphe.
- Validation douce uniquement (ex. lien sans `https://`).
- Le bouton « Compléter » du détail rouvre le parcours à la première section non renseignée.

## Micro-copies (section 3)

`flow.why.question` Pourquoi c'est important pour toi ? · `flow.why.placeholder` Parce que… · `flow.why.help` Pas besoin d'une grande raison. Une sensation, un souvenir ou une intuition suffisent. · `flow.why.example.before` « Parce que c'est bien. » · `flow.why.example.after` « Parce que je ne me souviens plus de la dernière fois où j'ai vu la Voie lactée, et que ça me manque. » · `flow.benefits.question` Qu'est-ce que ça t'apporterait ? · `flow.skip` Passer pour l'instant · `flow.next` Continuer

## Version phase 2

- Sections livrées : **1 Nommer, 2 Décrire, 3 Le pourquoi, 6 Premières pistes, 7 Relire & garder**. Préciser (SMART) et Qualifier arrivent en phase 3 et s'insèreront à leur place ; la progression affiche donc « x sur 5 » pour l'instant.
- Route : `/goals/:id/edit/:section` (`name`, `describe`, `why`, `first-steps`, `review`). Une section par écran sur mobile **et** sur desktop ; sur desktop, le sommaire collant est à gauche et l'aperçu en direct de la carte à droite (D-045).
- « Continuer » enregistre un instantané de l'historique (`section_exit`) et passe à la section suivante. « Passer pour l'instant » passe sans instantané.
- Annuler / rétablir : celui du navigateur dans les champs texte, celui de Tiptap dans la description. L'historique complet est consultable et restaurable (écran 9).
- Images d'inspiration : réservées aux carnets avec compte (stockage) ; une session anonyme voit « Les images seront disponibles une fois ton carnet relié à ton adresse. » Les liens restent possibles pour tous.

## Version phase 3

- Le parcours compte désormais ses **7 sections** : Nommer, Décrire, Le pourquoi, **Préciser** (écran 4), **Qualifier**, Premières pistes, Relire & garder.
- **Qualifier** (une seule colonne, groupes séparés par de l'air, chaque groupe facultatif et désélectionnable) :
  1. Catégories (chips multiples avec icône ; « + Créer une catégorie » ouvre un petit formulaire : nom et teinte).
  2. Difficulté (`StepSelector` 5 niveaux + phrase), Préparation (`StepSelector` 5 niveaux).
  3. Horizon (chips) + date cible facultative avec précision (jour, mois, saison, année).
  4. Énergie (`IconRadioGroup`), Budget (chips) + fourchette facultative en euros, Temps estimé (chips), Mode (`IconRadioGroup`).
  5. Saison / contexte (chips multiples), Lieu (texte libre, jamais de géolocalisation), Tags (saisie avec suggestions de ses propres tags).
- **Relire & garder** : choisir « Lâché consciemment » ouvre un champ facultatif « Un mot pour plus tard ? », gardé dans l'historique des statuts.
