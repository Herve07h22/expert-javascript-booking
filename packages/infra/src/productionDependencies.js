import pg from "pg";
import { configurePgTypes } from "./pgTypes.js";
import { SQLUserRepository } from "./SQLUserRepository.js";
import { SQLAccommodationRepository } from "./SQLAccommodationRepository.js";
import { SQLBookingRepository } from "./SQLBookingRepository.js";
import { SQLSessionRepository } from "./SQLSessionRepository.js";
import { SQLQueries } from "./SQLQueries.js";
import { SQLUnitOfWork } from "./SQLUnitOfWork.js";
import { EmailNotifications } from "./EmailNotifications.js";
import { scryptPasswordHasher } from "./scryptPasswordHasher.js";
import { systemDateProvider } from "@booking/core";
import { uuidProvider } from "./uuidProvider.js";

/**
 * La racine de composition : le SEUL fichier de l'application qui connaisse
 * à la fois PostgreSQL, le service de mail, le hachage et l'horloge système.
 *
 * Remarquez sa symétrie avec testDependencies(). Même forme, deux mondes.
 */
export function productionDependencies(config, { mailer, logger }) {
  configurePgTypes();
  const pool = new pg.Pool({ connectionString: config.databaseUrl, max: 10 });

  // Les repositories liés à une connexion donnée (le pool, ou un client
  // en transaction). C'est ce que l'unité de travail passera aux commandes.
  const repositoriesFor = (db) => ({
    users: new SQLUserRepository(db),
    accommodations: new SQLAccommodationRepository(db),
    bookings: new SQLBookingRepository(db),
    sessions: new SQLSessionRepository(db),
    queries: new SQLQueries(db),
    notifications,
    dateProvider: systemDateProvider,
    idProvider: uuidProvider,
    passwords: scryptPasswordHasher,
    logger,
  });

  const notifications = new EmailNotifications(mailer, config);

  const dependencies = repositoriesFor(pool);
  dependencies.unitOfWork = new SQLUnitOfWork(pool, (client) => {
    const scoped = repositoriesFor(client);
    scoped.unitOfWork = dependencies.unitOfWork;
    return scoped;
  });
  dependencies.close = () => pool.end();
  return dependencies;
}
