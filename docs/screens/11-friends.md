# Écran 11 — Amis

**Rôle** : partager quelques cartes avec des personnes choisies, et se soutenir (D-064). Jamais de classement, de score ou de comparaison.

Routes : `/friends` (onglet), `/friends/invite/:code` (invitation), `/friends/cards/:id` (carte d'un ami).

## Onglet Amis (`/friends`)

1. Titre « Amis » et phrase d'intention.
2. **Inviter un ami** (bloc accent) : explication (pas d'annuaire), « Créer mon lien d'invitation » puis le lien, « Partager le lien » (partage natif, sinon copie), « Copier le lien », « Renouveler le lien » (l'ancien cesse de fonctionner).
3. **Sur tes cartes** : ce que les amis ont fait sur tes cartes partagées (encouragement, message, « moi aussi », proposition d'aide), du plus récent au plus ancien ; chaque ligne mène à la carte.
4. **Leurs cartes** : grille des cartes partagées par les amis (« Carte de Bob » au-dessus de chaque carte), du plus récemment modifiée.
5. **Tes amis** : pseudo, nombre de cartes partagées, ancienneté ; « Retirer » demande une confirmation calme.
6. Sans compte : un seul bloc « Il te faut un compte pour avoir des amis » → connexion, retour sur l'onglet.

## Invitation (`/friends/invite/:code`)

« Alice t'invite à être ami·e sur {appName}. » + ce que cela permet. Connecté : « Accepter l'invitation » → onglet Amis. Sans compte : « Me connecter pour accepter » (retour sur l'invitation après connexion). Lien inconnu ou renouvelé : « Ce lien n'est plus valable ». Son propre lien : le dire simplement.

## Carte d'un ami (`/friends/cards/:id`)

« Carte d'Alice », la carte en grand (lecture seule), puis :

- **Encourager** : trois boutons à bascule « Bravo », « Courage », « Ça m'inspire », avec leur nombre ;
- **Moi aussi** (à bascule), puis « Ajouter à mes cartes » (crée une carte du même titre dans mon deck) ;
- **Je peux aider** : un mot facultatif, « Proposer mon aide » ; mes propositions et leur réponse ;
- pourquoi, premier pas, description ;
- **Messages** : fil court, champ « Ton message » (500 caractères), suppression de ses propres messages.

## Sur ma propre carte (page de la carte)

- **Qui peut voir cette carte ?** : « Moi seul » (défaut) / « Mes amis », avec ce que les amis voient (jamais les notes ni l'historique).
- **Côté amis** (si la carte est partagée ou a reçu quelque chose) : encouragements reçus, « N amis aimeraient aussi » avec leurs pseudos, propositions d'aide à accepter ou décliner (réversible), messages que je peux supprimer.

## Navigation

Barre du bas : Accueil · Cartes · + · Collection · Amis · Moi.

## Accessibilité

Boutons à bascule avec `aria-pressed`, choix de visibilité en `radiogroup`, confirmation de retrait dans un groupe nommé, messages d'état en `role="status"`. Aucune information portée par la couleur seule.
