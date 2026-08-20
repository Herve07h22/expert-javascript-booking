# Création d'une web application

Ce dépôt de code accompagne le cours en ligne
[sur la construction d'une web application en JavaScript](https://expert-javascript.fr/cours/01-description-projet).

Chaque branche `step-XX` est un instantané du projet à un moment du cours.

| branche | chapitres | contenu |
| --- | --- | --- |
| `step-01` | 1 → 16 | le domaine, les commandes, les dépendances de test |
| `step-02` | 17 → 23 | les Value Objects, le passage en monorepo |
| `step-03` | 24 → 26 | la première page React : loader, render, action |
| `step-04` | 27 → 29 | le bandeau de recherche, la capacité, la disponibilité |
| `step-05` | 30 → 33 | la session, l'écran de connexion, mes réservations, l'annulation |
| `step-06` | 34 → 35 | le port de notification et les événements de domaine |
| `step-07` | 36 → 39 | PostgreSQL, le repository SQL, les tests de contrat, la transaction |
| `step-08` | 40 → 42 | l'API HTTP, le front qui parle au back, les erreurs codées |
| `step-09` | 43 → 45 | TypeScript, l'état de chargement, classes ou fonctions |

## Installation

```bash
nvm use          # node 22
yarn             # toujours depuis la racine, jamais depuis un package
yarn test        # la suite rapide : quelques millisecondes
yarn typecheck   # à partir de step-09
```

À partir de `step-07`, une seconde suite vérifie les mêmes contrats contre une
vraie base de données. Un faux PostgreSQL partagerait les bugs de votre
compréhension de PostgreSQL :

```bash
docker run -d --rm --name booking-db \
  -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=booking_test \
  -p 55432:5432 postgres:16-alpine

TEST_DATABASE_URL=postgres://postgres:secret@localhost:55432/booking_test \
  yarn test:integration
```

Sans `TEST_DATABASE_URL`, cette suite ne ment pas : elle se déclare ignorée.

Attention : dans un monorepo, les dépendances sont mutualisées à la racine.
Lancer `yarn` depuis `packages/webapp` créerait un `node_modules` local et un
second `yarn.lock`, et `@booking/core` resterait introuvable.

## Lancer l'application

Jusqu'à `step-07`, le domaine s'exécute dans le navigateur :

```bash
yarn workspace @booking/webapp dev
```

À partir de `step-08`, il est passé derrière une API. Deux processus :

```bash
DATABASE_URL=postgres://postgres:secret@localhost:55432/booking_test \
PUBLIC_URL=http://localhost:5173 SMTP_URL=log:// \
  yarn workspace @booking/api start

yarn workspace @booking/webapp dev   # Vite relaie /api vers le port 3000
```

## Organisation

```
packages/core     le domaine. AUCUNE dépendance : il s'exécute partout.
packages/infra    les adaptateurs réels : PostgreSQL, mail, hachage.
packages/api      le serveur HTTP.
packages/webapp   React. Dépend de core, jamais de infra.
```

`webapp` ne déclare pas `infra` dans ses dépendances : aucun import ne peut y
remonter, même par accident, même dans six mois.

## Deux écarts avec le texte du cours

Les extraits de code des chapitres sont allégés pour rester lisibles. Ici :

- les imports relatifs portent leur extension (`./Stay.js`), comme l'exige
  ESM lorsque le package déclare `"type": "module"` ;
- la racine du monorepo expose un script `test`, pour pouvoir tout lancer
  d'une seule commande (et pour l'intégration continue) ;
- le hachage des mots de passe utilise `scrypt` (fourni par Node) plutôt
  qu'`argon2id`, pour éviter une dépendance native. Le port est le même,
  l'implémentation se remplace en une ligne du container.
