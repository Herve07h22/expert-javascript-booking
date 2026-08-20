import { App, subscribers, testDependencies } from "@booking/core";
import type { Dependencies } from "@booking/core";
import { productionDependencies } from "@booking/infra";
import { readConfig } from "./config.js";
import { createLogger } from "./logger.js";
import { createServer } from "./createServer.js";
import { smtpMailer } from "./smtpMailer.js";

const config = readConfig(process.env);
const logger = createLogger(config.logLevel);

// Le chapitre 20 l'avait annoncé : coder les dépendances en mémoire permet
// d'avoir une app fonctionnelle sans base de données installée.
const dependencies: Dependencies = config.useMemory
  ? testDependencies()
  : productionDependencies(config, {
      mailer: smtpMailer(config),
      logger,
    });

const app = new App(dependencies, subscribers);
const server = createServer(app, {
  logger,
  isProduction: config.isProduction,
  dependencies,
}).listen(config.port, () =>
  logger.info({ port: config.port, memory: config.useMemory }, "listening")
);

/**
 * Au déploiement, l'orchestrateur envoie SIGTERM. Par défaut, Node s'arrête
 * NET : au milieu d'une transaction, ou entre le commit et la publication
 * des événements.
 *
 * Trente lignes qui évitent les erreurs qui n'arrivent qu'au déploiement,
 * et que personne ne parvient jamais à reproduire.
 */
let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "shutting down");

  // On refuse les NOUVELLES connexions avant de terminer les anciennes :
  // l'inverse ne converge jamais.
  server.close(() => {
    void (async () => {
      await dependencies.close?.();
      process.exit(0);
    })();
  });

  // Filet : si une requête reste pendante, on ne bloque pas le déploiement.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

export { app, server, dependencies, logger, config };
