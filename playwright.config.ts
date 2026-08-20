import { defineConfig } from "@playwright/test";

/**
 * Un test de bout en bout est lent, instable par nature, et il échoue en
 * désignant l'écran plutôt que la cause. Il en faut AUSSI PEU QUE POSSIBLE.
 *
 * Ce qu'il vérifie, et que rien d'autre ne vérifie : le CÂBLAGE. Le cookie
 * posé par le contrôleur, lu par le navigateur, renvoyé à l'API, décodé par
 * authenticate.
 *
 * Deux conditions pour qu'il reste utilisable :
 * - des données de départ maîtrisées (ici : les dépendances en mémoire) ;
 * - le temps figé — notre dateProvider est un port, l'environnement de test
 *   lance le serveur avec un provider figé au 12 juin 2023, et rien d'autre
 *   ne change. C'est le dividende le plus tardif de tout le cours.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  // Une campagne qui dépend de l'ordre d'exécution est une campagne qui
  // échoue au hasard : chaque fichier repart d'un serveur neuf.
  workers: 1,
  use: {
    baseURL: "http://localhost:4173",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "yarn workspace @booking/api start",
      env: { USE_MEMORY: "1", PORT: "3001" },
      url: "http://localhost:3001/health",
      reuseExistingServer: false,
      stdout: "ignore",
    },
    {
      command: "yarn workspace @booking/webapp preview --port 4173 --strictPort",
      env: { API_URL: "http://localhost:3001" },
      url: "http://localhost:4173",
      reuseExistingServer: false,
      stdout: "ignore",
    },
  ],
});
