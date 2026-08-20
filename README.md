# Création d'une web application

Ce dépôt de code accompagne le cours en ligne
[sur la construction d'une web application en JavaScript](https://expert-javascript.fr/cours/01-description-projet).

Chaque branche `step-XX` est un instantané du projet à un moment du cours.
Toutes sont vérifiées par l'intégration continue : `git diff step-06 step-07`
montre exactement ce qu'une étape a changé.

| branche | chapitres | contenu |
| --- | --- | --- |
| `step-01` | 1 → 16 | le domaine, les commandes, les dépendances de test |
| `step-02` | 17 → 23 | les Value Objects, le passage en monorepo |
| `step-03` | 24 → 26 | la première page React : loader, render, action |
| `step-04` | 27 → 29 | le bandeau de recherche, la capacité, la disponibilité |
| `step-05` | 30 → 33 | la session, la connexion, mes réservations, l'annulation |
| `step-06` | 34 → 35 | le port de notification et les événements de domaine |
| `step-07` | 36 → 39 | PostgreSQL, le repository SQL, les tests de contrat, la transaction |
| `step-08` | 40 → 42 | l'API HTTP, le front qui parle au back, les erreurs codées |
| `step-09` | 43 → 45 | TypeScript, l'état de chargement, classes ou fonctions |
| `step-10` | 46 → 48 | la pyramide de tests, la mise en production |

## Installation

```bash
nvm use          # node 22
yarn             # TOUJOURS depuis la racine, jamais depuis un package
```

Dans un monorepo, les dépendances sont mutualisées à la racine. Lancer `yarn`
depuis `packages/webapp` créerait un `node_modules` local et un second
`yarn.lock`, et `@booking/core` resterait introuvable.

## Les suites de tests

```bash
yarn test              # le domaine, les contrats, l'API, les composants : ~1 s
yarn typecheck         # à partir de step-09
yarn test:integration  # les mêmes contrats, contre un vrai PostgreSQL
yarn e2e               # un scénario de bout en bout (step-10)
yarn test:all          # tout, sauf le bout en bout
```

Elles ne sont pas mélangées volontairement. `yarn test` tourne en continu
pendant que vous codez ; le reste tourne avant de pousser.

Pour les tests de contrat, il faut une base :

```bash
docker compose up -d db

TEST_DATABASE_URL=postgres://postgres:secret@localhost:55432/booking \
  yarn test:integration
```

Sans `TEST_DATABASE_URL`, cette suite ne ment pas : elle se déclare ignorée.

## Lancer l'application

Jusqu'à `step-07`, le domaine s'exécute dans le navigateur :

```bash
yarn workspace @booking/webapp dev
```

À partir de `step-08`, il est passé derrière une API. Le plus simple, pour une
démo, est de la lancer sans base de données :

```bash
USE_MEMORY=1 yarn workspace @booking/api start   # port 3000
yarn workspace @booking/webapp dev               # Vite relaie /api vers 3000
```

Avec PostgreSQL :

```bash
cp .env.example .env
docker compose up -d db
DATABASE_URL=postgres://postgres:secret@localhost:55432/booking \
  yarn workspace @booking/infra migrate
yarn workspace @booking/api start
```

Compte de démonstration : `faketenant@mail.com` / `secret`.

## Organisation

```
packages/core     le domaine. AUCUNE dépendance : il s'exécute partout.
packages/infra    les adaptateurs réels : PostgreSQL, mail, hachage.
packages/api      le serveur HTTP.
packages/webapp   React. Dépend de core, jamais de infra.
e2e               un scénario de bout en bout.
```

`webapp` ne déclare pas `infra` dans ses dépendances : aucun import ne peut y
remonter, même par accident, même dans six mois.

## Quelques écarts avec le texte du cours

Les extraits de code des chapitres sont allégés pour rester lisibles. Ici :

- les imports relatifs portent leur extension (`./Stay.js`), comme l'exige
  ESM ;
- la racine expose des scripts `test`, `typecheck` et `e2e`, pour l'intégration
  continue ;
- le hachage des mots de passe utilise `scrypt` (fourni par Node) plutôt
  qu'`argon2id`, pour éviter une dépendance native. Le port est le même,
  l'implémentation se remplace en une ligne du container ;
- le serveur est exécuté par `tsx`. Un vrai déploiement compilerait d'abord
  avec `tsc` ; cela n'apprend rien de plus et alourdirait chaque étape.
