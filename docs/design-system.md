# Design system — « le carnet »

> Version 0.2 · **direction retenue : A « Atelier »** (D-029). B et C restent décrites pour mémoire. Les trois directions artistiques sont visibles côte à côte, appliquées aux écrans clés, dans [`mockups/maquettes.html`](mockups/maquettes.html) (sélecteur de direction et de thème en haut de page).

## 1. Intention

Élan doit ressembler à **un beau carnet de projets personnel** : chaleureux, calme, lumineux, légèrement éditorial. Pas un outil de gestion de tâches, pas un tableau de bord.

- **Beaucoup d'air, peu d'éléments, un geste principal par écran.**
- **La page avant le widget** : les envies se lisent comme des pages, pas comme des lignes de tableau.
- **La couleur porte du sens, jamais seule** : toujours une icône et un libellé avec elle.
- **Ce qu'on évite** : dégradés violets, cartes génériques empilées, badges rouges, jauges, clipart, photos de stock.

## 2. Ce qui est commun aux trois directions

La **signature** ne change pas d'une direction à l'autre, seuls la palette, les polices et le traitement des surfaces varient.

1. **Le signet** : chaque carte d'envie porte un ruban marque-page vertical, accroché au bord supérieur et découpé en queue d'aronde, dans la teinte de sa première catégorie. Sur la page de détail, le signet est plus long et « pend » sur la page.
2. **La page de carnet** : la vue détail se pose sur un fond de papier pointillé très discret (points de 1 px tous les 20 px, ~6 % d'opacité). Le titre de l'envie est composé comme un titre de page : grand, serré, en police de titrage.
3. **L'emoji ou l'icône de l'envie** comme lettrine, choisis par la personne.
4. **Illustrations** au trait simple, formes organiques, une seule épaisseur de trait, deux couleurs maximum (encre + accent), pour l'onboarding et les états vides. Pas de personnages réalistes, pas de photos.

## 3. Les trois directions

Les contrastes ci-dessous sont mesurés (WCAG 2.x). Toutes les combinaisons texte / fond utilisées passent AA ; le texte courant (`ink` sur `paper` ou `card`) passe AAA.

### A · « Atelier » — terre cuite

Un carnet en papier crème, de l'argile, la lumière d'un atelier en fin d'après-midi. La plus chaleureuse et la plus « objet » des trois.

| Token | Clair | Sombre |
|---|---|---|
| `paper` (fond) | `#F6F1E9` | `#1C1814` |
| `paper-2` (fond creusé) | `#EFE7DB` | `#161310` |
| `card` (surface) | `#FFFCF7` | `#26201B` |
| `ink` (texte) | `#2A211C` | `#F1E8DD` |
| `ink-2` (texte secondaire) | `#5E5249` | `#C9BBAB` |
| `ink-3` (texte discret) | `#6F6257` | `#A39484` |
| `line` (bordures) | `#E2D6C6` | `#3A322B` |
| `accent` | `#A84B2A` | `#E59873` |
| `accent-ink` (texte sur accent) | `#FFF8F2` | `#2A1408` |
| `accent-soft` (fond sélectionné) | `#F4DFD3` | `#3E2A1F` |

Contrastes : `ink`/`paper` 14,0 · `ink-2`/`card` 7,4 · `accent`/`card` 5,5 · `accent-ink`/`accent` 5,4 (sombre : 14,6 · 8,6 · 7,0 · 7,6).

- **Typographie** : titres en **Fraunces** (serif à axes optiques, légèrement « soft », chaleureuse sans être rétro), interface en **Figtree** (sans-serif humaniste, ronde, très lisible).
- **Surfaces** : ombres très douces et chaudes (pas de bordure sur les cartes), rayon 14 px.
- **Pour** : la plus immédiatement « carnet », la plus mémorable. **Contre** : la terre cuite sur crème est une combinaison très répandue en ce moment ; il faudra soigner les détails (signet, illustrations) pour qu'elle reste à nous.

### B · « Herbier » — vert sauge profond

Un herbier, du papier légèrement vert-gris, des feuilles pressées. La plus apaisante des trois.

| Token | Clair | Sombre |
|---|---|---|
| `paper` | `#F1F2EC` | `#151A17` |
| `paper-2` | `#E7E9E0` | `#101411` |
| `card` | `#FBFBF7` | `#1D2420` |
| `ink` | `#1F2622` | `#E6ECE6` |
| `ink-2` | `#4C5850` | `#B6C2B9` |
| `ink-3` | `#5F6A62` | `#93A096` |
| `line` | `#D6DBD0` | `#2F3A33` |
| `accent` | `#3B6852` | `#93C5A8` |
| `accent-ink` | `#F4FAF6` | `#0F2318` |
| `accent-soft` | `#DCE8DF` | `#213328` |

Contrastes : `ink`/`paper` 13,7 · `ink-2`/`card` 7,2 · `accent`/`card` 6,2 · `accent-ink`/`accent` 6,0 (sombre : 14,7 · 8,6 · 8,1 · 8,5).

- **Typographie** : titres en **Newsreader** (serif éditoriale à axes optiques, élégante en grand), interface en **Nunito Sans** (humaniste, douce).
- **Surfaces** : fines bordures (1 px `line`) plutôt qu'ombres, rayon 12 px. Plus « papier posé à plat ».
- **Pour** : très calme, très lisible, le vert évoque la croissance sans dire « performance ». **Contre** : moins de chaleur immédiate ; risque de paraître un peu sage si les illustrations ne prennent pas le relais.

### C · « Encre » — bleu nuit chaud

Un carnet à couverture bleu nuit, de l'encre, une touche d'ocre comme un fil doré. La plus contrastée et la plus « écriture ».

| Token | Clair | Sombre |
|---|---|---|
| `paper` | `#F2EFE9` | `#131725` |
| `paper-2` | `#E8E4DC` | `#0F1220` |
| `card` | `#FDFBF8` | `#1B2033` |
| `ink` | `#1D2233` | `#ECE7DE` |
| `ink-2` | `#4A5066` | `#C0BCCB` |
| `ink-3` | `#5D6275` | `#9A97A8` |
| `line` | `#DCD7CD` | `#2C3248` |
| `accent` | `#33467A` | `#AEBDEB` |
| `accent-ink` | `#F5F6FC` | `#141A33` |
| `accent-soft` | `#E0E4F1` | `#242C4A` |
| `gilt` (décor seulement : filets, signet de l'accueil) | `#B8842A` | `#D9A94F` |

Contrastes : `ink`/`paper` 13,8 · `ink-2`/`card` 7,7 · `accent`/`card` 8,9 · `accent-ink`/`accent` 8,5 (sombre : 14,5 · 8,7 · 8,7 · 9,2).

- **Typographie** : titres en **Literata** (serif conçue pour la lecture longue, très belle en italique), interface en **Atkinson Hyperlegible** (conçue pour la lisibilité maximale, y compris en basse vision).
- **Surfaces** : cartes avec fine bordure et ombre très courte, rayon 16 px ; la vue détail remplace les pointillés par des **lignes de cahier** très pâles.
- **Pour** : la meilleure accessibilité (Atkinson), un mode sombre naturellement superbe (bleu nuit), une identité moins vue. **Contre** : le bleu peut évoquer un outil de travail si on ne garde pas le papier chaud et l'ocre.

### Choix

**Direction A « Atelier »**, retenue le 8 novembre 2026. Ses valeurs sont la référence de `src/styles/tokens.css`. Pour garder la terre cuite singulière, on soigne particulièrement le signet, le papier pointillé et les illustrations.

## 4. Tokens sémantiques

Les composants n'utilisent **que** ces noms. Une direction = un jeu de valeurs.

```css
/* Surfaces */
--color-paper  --color-paper-2  --color-card  --color-card-raised  --color-scrim
/* Texte */
--color-ink  --color-ink-2  --color-ink-3  --color-ink-on-accent
/* Traits */
--color-line  --color-line-strong  --color-focus
/* Accent */
--color-accent  --color-accent-soft  --color-accent-strong
/* États calmes */
--color-saved  --color-offline
/* Destruction (seul rouge du produit) */
--color-danger  --color-danger-soft
/* Catégories : teinte seule, la luminance est fixée par le thème */
--hue-category-<key>
--color-category-ribbon  --color-category-bg  --color-category-fg   /* calculées */
/* Statuts */
--hue-status-<key>
/* Typo */
--font-display  --font-ui
/* Formes */
--radius-sm 8px  --radius-md 12px  --radius-lg (12–16px selon direction)  --radius-pill 999px
--shadow-card  --shadow-sheet
/* Mouvement */
--duration-fast 150ms  --duration-base 200ms  --duration-slow 250ms
--ease-out cubic-bezier(.2,.8,.2,1)  --ease-spring cubic-bezier(.34,1.4,.64,1)
```

Le thème suit `prefers-color-scheme` par défaut ; le réglage manuel pose `data-theme="light"` ou `data-theme="dark"` sur `<html>`. Le mode sombre n'est pas une inversion : fonds bruns, verts ou bleus très sombres (jamais noir pur), accent éclairci, ombres remplacées par des bordures.

## 5. Couleurs de catégorie

Douze teintes espacées de 30° sur le cercle OKLCH, à **luminosité et saturation identiques**, ce qui garantit qu'aucune catégorie ne « crie » plus qu'une autre. Une treizième, neutre, pour « Autre ».

| Clé | Libellé | Teinte (h) | Icône Lucide |
|---|---|---|---|
| `family` | Famille & relations | 0 | `heart-handshake` |
| `social` | Social | 30 | `party-popper` |
| `travel` | Voyage & aventure | 60 | `tent` |
| `practical` | Organisation / vie pratique | 90 | `list-checks` |
| `finance` | Finances | 120 | `piggy-bank` |
| `sport_health` | Sport & santé | 150 | `activity` |
| `wellbeing` | Bien-être | 180 | `leaf` |
| `home` | Maison & matériel | 210 | `sofa` |
| `learning` | Intellectuel / apprentissage | 240 | `lightbulb` |
| `work` | Professionnel | 270 | `briefcase` |
| `volunteering` | Engagement / bénévolat | 300 | `hand-heart` |
| `creative` | Créatif | 330 | `palette` |
| `other` | Autre | — (chroma 0) | `shapes` |

| Usage | Clair | Sombre |
|---|---|---|
| Signet, fine bordure | `oklch(0.70 0.11 h)` | `oklch(0.72 0.10 h)` |
| Fond de pastille | `oklch(0.93 0.035 h)` | `oklch(0.30 0.04 h)` |
| Texte et icône de pastille | `oklch(0.42 0.08 h)` | `oklch(0.86 0.06 h)` |

Le texte des pastilles dépasse 7:1 sur leur fond. Le signet est décoratif (catégorie toujours nommée à côté).

## 6. Statuts

Teintes calmes, chroma faible, **aucun rouge ni orange vif**. Chaque statut a une icône et un libellé.

| Clé | Libellé | Icône | Teinte |
|---|---|---|---|
| `idea` | Idée | `feather` | neutre |
| `confirmed` | Envie confirmée | `heart` | accent |
| `preparing` | En préparation | `compass` | ocre doux (h 80) |
| `in_progress` | En cours | `footprints` | bleu doux (h 240) |
| `done` | Réalisé | `circle-check` | vert doux (h 150) |
| `paused` | En pause | `moon` | lavande (h 290) |
| `let_go` | Lâché consciemment | `wind` | sable (h 70, très pâle) |

« Réalisé » et « Lâché consciemment » ont le même poids visuel : les deux sont des fins positives.

## 7. Typographie

- **Deux familles** : titrage (serif) + interface (sans-serif humaniste), auto-hébergées via `next/font`, sous-ensemble latin, `font-display: swap`.
- **Échelle** (ratio 1,25, base 16 px) :

| Token | Taille | Interlignage | Usage |
|---|---|---|---|
| `text-xs` | 13 px | 1,4 | métadonnées, libellés de curseur (jamais pour du texte à lire) |
| `text-sm` | 14 px | 1,45 | pastilles, aides courtes |
| `text-base` | 16 px | 1,55 | interface, champs (≥ 16 px pour éviter le zoom iOS) |
| `text-md` | 18 px | 1,6 | descriptions, lecture longue |
| `text-lg` | 20 px | 1,35 | titres de carte (serif) |
| `text-xl` | 25 px | 1,25 | questions du parcours (serif) |
| `text-2xl` | 31 px | 1,15 | titres d'écran (serif) |
| `text-3xl` | 39 px | 1,05 | titre d'envie sur sa page (serif, interlettrage −0,01 em) |

- Longueur de ligne des descriptions : 60–70 caractères (`max-width: 65ch`).
- Titres en `text-wrap: balance`, paragraphes en `text-wrap: pretty`.
- Libellés de section en petites capitales simulées : 13 px, majuscules, interlettrage +0,06 em, `ink-3`.
- Taille de texte ajustable jusqu'à 200 % sans perte : tout est en `rem`, aucune hauteur fixe sur un conteneur de texte.

## 8. Espacements, formes, élévation

- Grille de 4 px. Échelle : 4, 8, 12, 16, 20, 24, 32, 40, 56, 72.
- Gouttière mobile 20 px, desktop 32 px. Espace entre sections d'un écran : 32 px.
- Rayons : 8 (petits contrôles), 12 (champs, boutons), 12–16 (cartes, selon direction), 24 (haut des sheets), 999 (chips).
- Élévation : 3 niveaux seulement. `card` (repos), `card-raised` (sheet, menu), `scrim` (voile derrière une sheet, 40 % d'encre).
- Cibles tactiles ≥ 44 × 44 px, même si le visuel est plus petit.

## 9. Mouvement

| Moment | Effet | Durée |
|---|---|---|
| Ouverture d'une sheet | glissement vers le haut + voile | 250 ms, `ease-out` |
| « Garder » une envie | la carte se pose avec un léger rebond (échelle 0,96 → 1) | 220 ms, `ease-spring` |
| Changement de section | fondu + glissement de 8 px | 200 ms |
| Sélection d'une chip | fond qui se remplit, coche qui apparaît | 150 ms |
| « Enregistré » | fondu discret, aucune animation en boucle | 150 ms |

Tout est coupé sous `prefers-reduced-motion: reduce` (remplacé par des fondus de 0 ms). Pas de confettis, pas de sons. Retour haptique léger (`navigator.vibrate(10)`) sur « Garder » quand c'est disponible et non désactivé.

## 10. Composants

Chaque composant a sa story Storybook (états, clair / sombre, mobile / desktop) avant d'être utilisé.

| Composant | Rôle | États clés |
|---|---|---|
| `Button` | primaire (accent plein), secondaire (contour), discret (texte) | repos, survol, focus, appuyé, désactivé, chargement (sans spinner plein écran) |
| `Chip` / `ChipGroup` | choix simple ou multiple, valeurs, saisons, relances | non sélectionné, sélectionné (coche + fond `accent-soft`), focus. Rôle `radio` ou `checkbox`. |
| `StepSelector` | échelle à libellés (difficulté, préparation) | radios natifs stylés ; libellé + phrase d'explication du niveau choisi |
| `IconRadioCard` | énergie, mode, temps estimé | icône + libellé, sélection par bordure accent + coche |
| `Field` | libellé + aide courte + exemple avant / après + champ | vide, rempli, aide ouverte, message doux |
| `HelpDrawer` | aide du « ? » : explication, exemple avant → après | sheet sur mobile, popover ancré sur desktop |
| `Sheet` | capture express, filtres, choix longs | glisser pour fermer, `Esc`, focus piégé |
| `SaveIndicator` | « Enregistré » / « Enregistrement… » / « Hors ligne, gardé sur cet appareil » | `aria-live="polite"` |
| `CompletenessMeter` | Esquisse · En bonne voie · Bien remplie | 3 segments doux, libellé toujours visible, jamais de pourcentage |
| `GoalCard` | carte d'envie avec signet | compacte (liste), large (accueil), aperçu (parcours desktop), squelette |
| `CategoryPill` / `StatusPill` | catégorie / statut | icône + libellé + teinte |
| `SectionNav` | progression du parcours | points (mobile), sommaire collant (desktop) : fait, en cours, passé, vide |
| `RichTextEditor` | description | barre d'outils minimale, relances en chips |
| `BottomNav` / `SideNav` | navigation | 4 entrées ; « + » central mis en avant |
| `EmptyState` | états vides | illustration + phrase + 3 exemples à tapoter |
| `Toast` | confirmation, « Annuler » | en bas, au-dessus de la navigation, 6 s, jamais pour une erreur bloquante |
| `Skeleton` | chargement | formes de la carte réelle, pulsation douce coupée en mouvement réduit |

## 11. Mise en page et responsive

- **Mobile (360–430)** : une colonne, barre de navigation basse à 4 entrées (Accueil · Mes envies · + · Moi), actions principales dans le tiers bas, sheets pour les choix.
- **Tablette (≥ 768)** : deux colonnes pour la liste, la navigation passe en rail latéral.
- **Desktop (≥ 1024)** : navigation latérale repliable ; liste à gauche et détail à droite ; parcours en trois zones (sommaire collant · formulaire · aperçu en direct de la carte). Largeur de lecture plafonnée à 65 ch, contenu centré dans 1280 px max.
- **Raccourcis** : `N` nouvelle envie, `/` recherche, `Esc` fermer, `Ctrl/Cmd+Z` annuler.

## 12. Accessibilité

- Contrastes AA minimum, AAA pour le texte courant (vérifiés en CI par axe sur Storybook et les E2E).
- Focus visible partout : anneau de 2 px `focus` + 2 px d'écart, jamais supprimé.
- Contrôles personnalisés construits sur des éléments natifs (`input type="radio"`, `checkbox`, `button`) : le clavier et les lecteurs d'écran fonctionnent sans ARIA bricolé.
- Chaque champ a un `<label>` visible ; l'aide est reliée par `aria-describedby`.
- Messages de sauvegarde et toasts en `aria-live="polite"`.
- Images d'inspiration : texte alternatif proposé à l'ajout.

## 13. Écrans

Descriptions détaillées dans [`screens/`](screens/) :
[Accueil](screens/01-home.md) · [Capture express](screens/02-express-capture.md) · [Parcours fiche complète](screens/03-full-sheet-flow.md) · [Détail d'une envie](screens/06-goal-detail.md).
