# Écran 7 — Connexion et création de compte

**Rôle** : retrouver ou sauvegarder son carnet, sans friction. Une seule page pour se connecter et créer un compte.

Route : `/sign-in`. Accessible depuis « Moi » et depuis le bandeau des sessions anonymes.

## Hiérarchie

1. Titre serif : « Retrouver ton carnet » (ou « Garder ton carnet sur tous tes appareils » si une session anonyme existe déjà).
2. Phrase : « On t'envoie un lien par e-mail. Pas de mot de passe à retenir. »
3. Champ e-mail + bouton primaire « Recevoir le lien ».
4. Séparateur « ou », bouton secondaire « Continuer avec Google ».
5. Lien discret « Utiliser un mot de passe » qui déplie : mot de passe (10 caractères minimum, bouton afficher / masquer), deux boutons « Me connecter » et « Créer mon compte ».
6. Mention sous les boutons : « En continuant, tu confirmes avoir 15 ans ou plus et accepter la politique de confidentialité. » (lien).

## Après l'envoi du lien

Le formulaire laisse place à : « Regarde ta boîte mail. Le lien est valable une heure. » + « Renvoyer le lien » (après 60 s) + « Changer d'adresse ».

## Session anonyme existante

Le lien magique et Google **convertissent** la session (les envies restent) : `updateUser({ email })` ou `linkIdentity({ provider: 'google' })`. Le mot de passe se définit ensuite dans « Moi ».

## Messages doux

| Cas                                | Texte                                                                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| E-mail mal formé                   | Cette adresse ne semble pas complète.                                                                                           |
| Mot de passe trop court            | Il faut au moins 10 caractères.                                                                                                 |
| Identifiants refusés               | Cette combinaison ne fonctionne pas. Tu peux aussi recevoir un lien par e-mail.                                                 |
| Adresse déjà utilisée (conversion) | Cette adresse a déjà un carnet. Connecte-toi avec elle : les envies de cet appareil resteront ici jusqu'à ce que tu choisisses. |
| Trop de tentatives                 | Beaucoup d'essais d'un coup. Réessaie dans une minute.                                                                          |
| Réseau                             | Pas de connexion pour l'instant. Réessaie dès que le réseau revient.                                                            |
