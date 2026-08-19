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

## Installation

```bash
nvm use          # node 22
yarn             # toujours depuis la racine, jamais depuis un package
yarn test        # les tests du domaine
```

Attention : dans un monorepo, les dépendances sont mutualisées à la racine.
Lancer `yarn` depuis `packages/webapp` créerait un `node_modules` local et un
second `yarn.lock`, et `@booking/core` resterait introuvable.

## Lancer l'application

```bash
cd packages/webapp
yarn dev
```

## Deux écarts avec le texte du cours

Les extraits de code des chapitres sont allégés pour rester lisibles. Ici :

- les imports relatifs portent leur extension (`./Stay.js`), comme l'exige
  ESM lorsque le package déclare `"type": "module"` ;
- la racine du monorepo expose un script `test`, pour pouvoir tout lancer
  d'une seule commande (et pour l'intégration continue).
