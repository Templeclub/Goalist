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
