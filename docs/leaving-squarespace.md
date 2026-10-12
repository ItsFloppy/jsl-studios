# Quitter Squarespace

Procédure pour sortir de Squarespace sans perdre les mails. Le site part sur Netlify, les deux
domaines partent chez Cloudflare, et Google Workspace est facturé par Google directement.
Les actions se font dans les comptes (Squarespace, Netlify, Cloudflare, console Google) : rien
ici ne se lance depuis le code.

État relevé le 12/10/2026.

## Ce qu'il faut retenir

- **Les boîtes mail, les mails et les contacts sont chez Google, pas chez Squarespace.**
  Squarespace ne fait que revendre et facturer Workspace. Quitter Squarespace ne les supprime pas.
- **Les mails ne dépendent que de quelques entrées DNS** (MX, SPF, DMARC, vérification Google).
  Tant qu'elles sont recopiées à l'identique à chaque changement, le courrier continue d'arriver.
  Si on les oublie, les nouveaux mails sont refusés jusqu'à ce qu'on les remette, mais rien de
  stocké n'est perdu.
- **Deux erreurs à ne pas faire** :
  1. Laisser l'abonnement Workspace expirer sans le transférer (messagerie suspendue, puis compte
     détaché après 40 jours).
  2. Changer de serveurs DNS sans avoir recopié les entrées mail.
- **Résilier le site Squarespace ne coupe pas Workspace**. Workspace continue de se renouveler sur
  la carte enregistrée chez Squarespace, d'où l'étape 2.

## Ce que ça change en coûts

| Poste | Aujourd'hui (Squarespace) | Après |
| --- | --- | --- |
| Site | Abonnement Squarespace (boutique et espace membres compris) | Netlify, offre gratuite à crédits |
| Workspace | 7 $/utilisateur/mois en annuel (8,40 $ en mensuel) | Même tarif chez Google |
| Domaines .com | Tarif Squarespace | ~10,50 $/an chacun chez Cloudflare (prix coûtant) |

Le transfert vers Cloudflare se paie une fois par domaine (~10,50 $) et ajoute un an
d'enregistrement.

## Inventaire DNS

À garder sous la main : c'est la référence pour chaque étape.

### jsl-studios.com (domaine principal, adresses mail)

| Type | Nom | Valeur | Rôle |
| --- | --- | --- | --- |
| NS | @ | `ns-cloud-e1.googledomains.com` … `ns-cloud-e4.googledomains.com` | Serveurs DNS (Squarespace, ex-Google Domains) |
| A | @ | `198.185.159.144`, `198.185.159.145`, `198.49.23.144`, `198.49.23.145` | Site Squarespace (à remplacer) |
| CNAME | www | `ext-sq.squarespace.com` | Site Squarespace (à remplacer) |
| MX | @ | `1 aspmx.l.google.com` | **Mail Google** |
| MX | @ | `5 alt1.aspmx.l.google.com` | **Mail Google** |
| MX | @ | `5 alt2.aspmx.l.google.com` | **Mail Google** |
| MX | @ | `10 alt3.aspmx.l.google.com` | **Mail Google** |
| MX | @ | `10 alt4.aspmx.l.google.com` | **Mail Google** |
| TXT | @ | `v=spf1 include:_spf.google.com -all` | **SPF (mail)** |
| TXT | @ | `google-site-verification=qRqLaI6_vXHECD2YxhZZVNMtgeoeP76rbRSOexg-rVk` | Vérification Google |
| TXT | _dmarc | `v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s` | **DMARC (mail)** |

Pas de DKIM (`google._domainkey` absent), alors que le DMARC est en `p=reject` : voir l'étape 5.
DNSSEC : désactivé (aucun enregistrement DS).

### justinslstudios.com (adresse actuelle du site Squarespace)

| Type | Nom | Valeur | Rôle |
| --- | --- | --- | --- |
| NS | @ | `ns01`…`ns04.squarespacedns.com`, `dns1`…`dns4.p08.nsone.net` | Serveurs DNS Squarespace |
| A | @ | mêmes 4 adresses Squarespace | Site Squarespace |
| CNAME | www | `ext-sq.squarespace.com` | Site Squarespace |
| MX | @ | les mêmes 5 MX Google | Mail Google |

Ni SPF ni DMARC. DNSSEC désactivé.

Aujourd'hui, jsl-studios.com redirige vers justinslstudios.com, qui sert le site Squarespace
(boutique, pages films, « On Demand »). Après la migration, ce sera l'inverse :
justinslstudios.com redirigera vers jsl-studios.com.

Avant chaque étape, relever l'état réel (le DNS a pu bouger depuis le 12/10/2026) :

```sh
nslookup -type=MX jsl-studios.com 8.8.8.8
nslookup -type=TXT jsl-studios.com 8.8.8.8
nslookup -type=TXT _dmarc.jsl-studios.com 8.8.8.8
nslookup -type=NS jsl-studios.com 8.8.8.8
```

## 0. Préalables

- [ ] **Accès super-admin à admin.google.com** testé, avec un compte qui ne passe pas par
      Squarespace pour se connecter.
- [ ] Dans la console Google (Compte → Domaines → Gérer les domaines) : noter si
      justinslstudios.com fait partie du même Workspace (domaine secondaire ou alias) et si des
      adresses @justinslstudios.com servent encore.
- [ ] Dans Squarespace (Paramètres → Facturation) : noter le forfait Workspace, le nombre de
      licences et la **date de renouvellement**. Les forfaits annuels ne sont remboursés que dans
      une fenêtre limitée : faire l'étape 2 peu avant cette date évite de payer deux fois.
- [ ] **Abonnés payants de l'offre POTA « On Demand »** (espace membres) : exporter la liste, les
      prévenir, arrêter les renouvellements et rembourser si besoin. Le streaming disparaît avec
      le site Squarespace.
- [ ] **Boutique** (abandonnée) : exporter commandes et produits en CSV pour la compta, traiter
      les commandes en cours, puis fermer la boutique.
- [ ] Exporter ce qui doit être gardé du site (textes, images).
- [ ] Ne **pas** modifier le titulaire ni l'e-mail de contact des domaines avant le transfert :
      ce changement peut déclencher un verrou de 60 jours qui bloque le transfert.

## 1. Mettre le nouveau site en ligne sans toucher aux mails

Les serveurs DNS restent chez Squarespace. On ne change que les deux entrées du site.

1. **Netlify** → le site → Domain management → Add a domain → `jsl-studios.com`, puis le
   définir comme **domaine principal**. Netlify ajoute `www` et le redirige vers le domaine nu.
   Noter les valeurs DNS que Netlify affiche (normalement `A @ 75.2.60.5` et
   `CNAME www <site>.netlify.app`).
2. **Squarespace**, réglages du site : déconnecter jsl-studios.com du *site* (Paramètres →
   Domaines). Il s'agit de le détacher du site, **pas** de supprimer ni d'annuler le domaine.
   Les libellés de l'interface peuvent varier.
3. **Squarespace → Domaines → jsl-studios.com → DNS** :
   - supprimer les 4 entrées A Squarespace et le CNAME `www` (souvent regroupés dans le bloc
     « Squarespace Defaults ») ;
   - ajouter les entrées données par Netlify ;
   - **ne pas toucher** au bloc Google Workspace (MX, SPF) ni aux TXT.
4. Attendre que Netlify affiche le certificat HTTPS (de quelques minutes à une heure).
5. **Netlify → Deploys → Trigger deploy → Clear cache and deploy.** Les canoniques et le
   sitemap prennent l'adresse du site au moment du build (`URL`) : sans nouveau build, ils
   pointent encore vers `*.netlify.app`.
6. **sanity.io/manage** → le projet → API → CORS origins : ajouter `https://jsl-studios.com`
   (Allow credentials coché), sinon le Studio en `/studio` ne pourra plus se connecter.

Tests :

- `https://jsl-studios.com` affiche le nouveau site ; `https://www.jsl-studios.com` redirige.
- `https://jsl-studios.com/sitemap.xml` contient des URL en `https://jsl-studios.com/`.
- `https://jsl-studios.com/studio` : connexion possible.
- Envoyer un mail **depuis l'extérieur** (une adresse perso) vers une adresse @jsl-studios.com et
  répondre : les deux passent.

Retour arrière : remettre les 4 entrées A Squarespace et le CNAME `www` →
`ext-sq.squarespace.com`.

## 2. Workspace facturé par Google

1. **Squarespace → Paramètres → Facturation → Abonnements → Google Workspace → Annuler
   l'abonnement**, puis confirmer deux fois. Chez Squarespace, annuler Workspace signifie le
   transférer à Google : selon leur documentation, mails, contacts et contenus restent intacts.
2. Le compte entre dans une **période de grâce de 7 jours** chez Google. Pendant ce délai :
   admin.google.com → Facturation → configurer le forfait et le moyen de paiement.
3. Vérifier dans Facturation → Abonnements que Google est bien le facturant.

Tests : envoi et réception d'un mail, et connexion à Gmail pour chaque utilisateur.

Retour arrière : **aucun**. Le transfert est définitif : le compte ne peut pas revenir chez
Squarespace. D'où les préalables.

## 3. Domaines chez Cloudflare

Deux temps : d'abord le DNS passe chez Cloudflare (le domaine reste enregistré chez
Squarespace), ensuite l'enregistrement lui-même est transféré. Ainsi, pendant le transfert
(jusqu'à 5 jours), le DNS ne bouge plus.

Pour **jsl-studios.com** :

1. Créer le compte Cloudflare avec une adresse partagée de l'équipe IT et activer la double
   authentification.
2. **Add a site** → `jsl-studios.com` → offre Free. Cloudflare importe les entrées existantes.
3. **Comparer ligne par ligne avec l'inventaire** et ajouter ce qui manque : les 5 MX, le SPF, la
   vérification Google, `_dmarc`.
4. Entrées du site : `CNAME @ <site>.netlify.app` (Cloudflare l'« aplatit » au domaine nu) et
   `CNAME www <site>.netlify.app`, **en « DNS only » (nuage gris)**. Netlify déconseille de
   passer son trafic par le proxy Cloudflare.
5. DNSSEC : vérifier qu'il est toujours désactivé chez Squarespace. S'il a été activé entre-temps,
   le désactiver et attendre 24 h avant l'étape suivante, sinon le domaine cesse de répondre.
6. **Squarespace → Domaines → jsl-studios.com → Serveurs de noms** : remplacer par les deux
   serveurs Cloudflare indiqués.
7. Attendre que Cloudflare indique la zone **Active** (de quelques minutes à 24 h).
8. Refaire les tests de l'étape 1, plus
   `nslookup -type=NS jsl-studios.com 8.8.8.8` → serveurs Cloudflare et
   `nslookup -type=MX jsl-studios.com 8.8.8.8` → les 5 MX Google.
9. **Transfert** :
   - Squarespace → le domaine → désactiver le verrou du domaine → « Request transfer code » (le
     code arrive par e-mail sous 24 h) ;
   - Cloudflare → Domain Registration → Transfer Domains → coller le code et payer ;
   - approuver l'e-mail de confirmation s'il arrive (sinon le transfert aboutit seul en 5 jours
     au plus).

Pour **justinslstudios.com** : même chose, mais avec la configuration DNS de l'étape 4 au lieu
des entrées Netlify.

Retour arrière, avant le transfert : remettre les serveurs de noms d'origine chez Squarespace
(`ns-cloud-e1`…`e4.googledomains.com`). Après le transfert, tout se règle dans Cloudflare.

## 4. justinslstudios.com redirige vers jsl-studios.com

Les redirections se font chez Cloudflare : elles ne passent pas par Netlify et ne consomment
donc aucun crédit.

1. DNS de justinslstudios.com dans Cloudflare :
   - supprimer les entrées A et `www` Squarespace ;
   - ajouter `A @ 192.0.2.1` et `A www 192.0.2.1` en **proxy (nuage orange)**. Cette adresse ne
     sert à rien en elle-même : le proxy répond avant de l'atteindre ;
   - **garder les 5 MX Google** si le domaine sert encore aux mails (voir les préalables).
2. Rules → Redirect Rules → créer, dans cet ordre (301, « Preserve query string » décoché) :

   | # | Si le chemin… | Rediriger vers |
   | --- | --- | --- |
   | 1 | `starts_with(http.request.uri.path, "/movies") or starts_with(http.request.uri.path, "/on-demand")` | `https://jsl-studios.com/studios` |
   | 2 | `http.request.uri.path eq "/contact-us"` | `https://jsl-studios.com/about#contact` |
   | 3 | `http.request.uri.path eq "/justin-souriaulevine"` | `https://jsl-studios.com/justin-souriau-levine` |
   | 4 | `http.request.uri.path in {"/robert-a-levine" "/antoine-bonnefoy" "/bruce-d-levine" "/marco-rosati" "/francois-grunenwald" "/erin-gorski" "/sbastien-freland" "/magali-souriau" "/anne-hobbs" "/justin-mielke" "/christopher-kondoleon" "/theodore-verzat" "/hugo-bonnain" "/elizabeth-thurley" "/audrey-kern" "/martin-cornu-mansuy"}` | `https://jsl-studios.com/about#team` |
   | 5 | `http.request.uri.path eq "/about"` | `https://jsl-studios.com/about` |
   | 6 | toutes les requêtes (boutique, `/home`, `/cart`, le reste) | `https://jsl-studios.com/` |

   Les chemins viennent du sitemap de l'ancien site (relevé le 12/10/2026).
3. **Google Search Console** : vérifier les deux domaines (la vérification TXT de
   jsl-studios.com existe déjà), puis sur la propriété justinslstudios.com : Paramètres →
   Changement d'adresse → jsl-studios.com.

Tests :

```sh
curl -sI https://justinslstudios.com/movies/planet-of-the-astronauts   # 301 → /studios
curl -sI https://www.justinslstudios.com/contact-us                    # 301 → /about#contact
curl -sI https://justinslstudios.com/boutique                          # 301 → /
```

## 5. Signature DKIM des mails

Indépendant du départ, mais à faire une fois le DNS chez Cloudflare (pour ne le faire qu'une
fois). Avec un DMARC en `p=reject` et sans DKIM, un mail transféré ou relayé (liste de
diffusion, redirection) peut être rejeté.

1. admin.google.com → Applications → Google Workspace → Gmail → Authentifier les e-mails →
   jsl-studios.com → Générer un enregistrement (2048 bits, préfixe `google`).
2. Cloudflare → DNS → `TXT google._domainkey` avec la valeur donnée.
3. Attendre ~1 h, puis « Démarrer l'authentification » dans la console.

Test : envoyer un mail à une adresse Gmail → « Afficher l'original » → `DKIM: PASS`.

## 6. Résilier Squarespace

Une fois les étapes 1 à 4 vérifiées et les préalables (POTA, boutique, exports) traités :

1. Squarespace → Paramètres → Facturation → Site web → annuler l'abonnement.
2. Vérifier qu'il ne reste aucun abonnement actif chez Squarespace (domaines transférés,
   Workspace transféré, extensions éventuelles) et que rien ne se renouvelle.

Ce qui disparaît alors : la boutique, l'espace membres « On Demand » (streaming de POTA) et les
pages de l'ancien site, déjà redirigées à l'étape 4.

## Récapitulatif

| Étape | Risque pour les mails | Durée | Réversible |
| --- | --- | --- | --- |
| 0. Préalables | Aucun | Selon les exports | — |
| 1. Site sur Netlify | Aucun (MX inchangés) | ~1 h | Oui |
| 2. Workspace chez Google | Faible (7 jours pour payer) | ~15 min | **Non** |
| 3. DNS et domaines chez Cloudflare | **Oui, si une entrée mail est oubliée** | 1 à 5 jours | Oui, avant le transfert |
| 4. Redirections | Aucun (MX gardés) | ~30 min | Oui |
| 5. DKIM | Aucun | ~1 h | Oui |
| 6. Résiliation | Aucun | ~10 min | Non |
