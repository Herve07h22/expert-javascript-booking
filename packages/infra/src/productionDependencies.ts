import pg from "pg";
import { systemDateProvider } from "@booking/core";
import type { Dependencies, Logger, UnitOfWork } from "@booking/core";
import { configurePgTypes } from "./pgTypes.js";
import { SQLUserRepository } from "./SQLUserRepository.js";
import { SQLAccommodationRepository } from "./SQLAccommodationRepository.js";
import { SQLBookingRepository } from "./SQLBookingRepository.js";
import { SQLSessionRepository } from "./SQLSessionRepository.js";
import { SQLQueries } from "./SQLQueries.js";
import { SQLUnitOfWork } from "./SQLUnitOfWork.js";
import { EmailNotifications } from "./EmailNotifications.js";
import { scryptPasswordHasher } from "./scryptPasswordHasher.js";
import { uuidProvider } from "./uuidProvider.js";
import type { Mailer } from "./EmailNotifications.js";
import type { Queryable } from "./Queryable.js";

export interface ProductionConfig {
  databaseUrl: string;
  baseUrl: string;
  from: string;
}

/**
 * La racine de composition : le SEUL fichier de l'application qui connaisse à
 * la fois PostgreSQL, le service de mail, le hachage et l'horloge système.
 *
 * Remarquez sa symétrie avec testDependencies(). Même forme, deux mondes.
 */
export function productionDependencies(
  config: ProductionConfig,
  { mailer, logger }: { mailer: Mailer; logger: Logger }
): Dependencies {
  configurePgTypes();
  const pool = new pg.Pool({ connectionString: config.databaseUrl, max: 10 });
  const notifications = new EmailNotifications(mailer, config);

  // Les repositories liés à une connexion donnée : le pool, ou un client
  // en transaction. C'est ce que l'unité de travail passera aux commandes.
  type WithoutUnitOfWork = Omit<Dependencies, "unitOfWork"> & {
    unitOfWork?: Dependencies["unitOfWork"];
  };

  const repositoriesFor = (db: Queryable): WithoutUnitOfWork =>
    ({
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

  const dependencies = repositoriesFor(pool);
  const unitOfWork: UnitOfWork = new SQLUnitOfWork(pool, (client) => {
    const scoped = repositoriesFor(client);
    scoped.unitOfWork = unitOfWork;
    return scoped as Dependencies;
  });
  dependencies.unitOfWork = unitOfWork;
  dependencies.close = () => pool.end();
  return dependencies as Dependencies;
}
