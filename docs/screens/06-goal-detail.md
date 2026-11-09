# Écran 6 — Détail d'une envie (« la page de carnet »)

**Rôle** : relire son envie comme une belle page, et savoir en un coup d'œil ce qu'on pourrait y ajouter.

## Hiérarchie (mobile)

1. **Barre haute** : retour « Mes envies », menu « … » (Modifier le statut, Historique, Mettre de côté).
2. **La page** : fond `paper` pointillé (ou lignes de cahier en direction C), signet long de la couleur de la première catégorie, accroché en haut à droite.
3. **Lettrine** : emoji de l'envie (40 px).
4. **Titre** serif `text-3xl`, serré, `text-wrap: balance`. **Accroche** en serif italique `text-md`, `ink-2`.
5. **Ligne de repères** : `StatusPill`, `CategoryPill`(s), échéance souple (« Avant fin août »).
6. **Sections repliables** (`<details>`, ouvertes par défaut si remplies) :
   - **Ce que j'imagine** : description riche + résultat imaginé + où / avec qui.
   - **Pourquoi c'est important** : texte + valeurs cochées en pastilles neutres.
   - **En clair** : la phrase SMART en citation, « 4 critères sur 5 renseignés » + lien « Préciser ».
   - **Repères** : grille 2 colonnes libellé / valeur avec icônes (difficulté avec 5 points, préparation, horizon, énergie, budget, temps, mode, saison, lieu, tags).
   - **Première petite étape** : bloc mis en valeur (fond `accent-soft`).
   - **Notes**.
7. **À compléter, quand tu veux** : bloc en pointillés listant les sections vides en chips (« Où / avec qui ? », « Images d'inspiration »). Disparaît quand tout est rempli.
8. **Pied** : « Gardée le 12 octobre · modifiée hier » + lien « Historique ».
9. **Barre d'action basse** : « Compléter la fiche » (primaire, rouvre le parcours à la première section vide) · bouton de statut (ouvre une sheet de statuts).

## Desktop

Master-detail : liste à gauche (360 px), page à droite, largeur de lecture 65 ch, repères en colonne latérale à droite de la page au-delà de 1280 px.

## États

- **Envie « Esquisse »** (titre seul) : la page affiche le titre, puis directement le bloc « À compléter » avec une phrase d'invitation : « Cette envie n'a qu'un titre pour l'instant, et c'est déjà bien. Tu veux lui donner un peu de corps ? »
- **Réalisé** : signet doré et petite mention « Réalisé le 3 septembre ». Aucune animation.
- **Lâché consciemment** : mention « Tu as choisi de laisser partir cette envie » + éventuel mot laissé à ce moment-là.
- **Date passée** : sous les repères, phrase neutre « La date que tu avais notée est passée. Tu veux la déplacer, ou l'enlever ? »

## Micro-copies

`goal.detail.imagine` Ce que j'imagine · `goal.detail.why` Pourquoi c'est important · `goal.detail.smart` En clair · `goal.detail.smartClarity` {count} critères sur 5 renseignés · `goal.detail.facts` Repères · `goal.detail.firstStep` Première petite étape · `goal.detail.toComplete` À compléter, quand tu veux · `goal.detail.complete` Compléter la fiche

## Version phase 1 (détail minimal)

- Barre haute : retour « Mes envies ».
- Page pointillée, signet (neutre tant qu'il n'y a pas de catégorie), `SaveIndicator` en haut à droite.
- **Nommer, directement sur la page** : emoji (champ court), titre en serif `text-3xl` éditable en place (zone de texte qui s'agrandit), accroche en serif italique éditable. Sauvegarde automatique (700 ms) ; vider le titre n'efface pas l'envie : le dernier titre non vide reste gardé et un message doux le dit.
- `StatusPill` et mention « Gardée le {date} ».
- Les autres sections du parcours arrivent en phase 2 ; aucun bouton ne mène encore vers elles.
- Envie introuvable ou d'un autre carnet : « Cette envie n'est pas dans ton carnet. » + lien « Mes envies ».

## Version phase 3

- Section **En clair** : phrase SMART en citation + « {n} critères sur 5 renseignés » + lien « Préciser ».
- Section **Repères** : grille 2 colonnes (icône, libellé, valeur) des critères renseignés uniquement ; difficulté avec 5 points.
- Pastilles de toutes les catégories ; tags en petites étiquettes neutres.
- Statut « Lâché consciemment » : phrase « Tu as choisi de laisser partir cette envie. Elle reste dans ton carnet si tu veux y repenser. » + le mot laissé, s'il existe.

## Version simplifiée (D-060, D-061)

- Le signet prend la couleur de la première catégorie (la couleur propre à l'envie ne sert plus que s'il n'y a pas de catégorie).
- Ligne de repères : statut, catégorie(s), horizon court, et « À anticiper » si la préparation est lourde.
- La section « En clair » (phrase SMART) est remplacée par **Pour y arriver** : la réponse à « Qu'est-ce qui rend ça possible ? ».
- L'accroche et les tags ne sont plus affichés. Les autres contenus saisis auparavant (où / avec qui, images, notes…) restent visibles s'ils existent.
- « À compléter » propose les sections du nouveau parcours : L'envie, Le pourquoi, Préciser, Premier pas.
- Desktop : page seule, plus de master-detail.
