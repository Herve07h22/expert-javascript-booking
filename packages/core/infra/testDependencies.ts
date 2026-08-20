import { MemoryUserRepository } from "./MemoryUserRepository.js";
import { MemoryBookingRepository } from "./MemoryBookingRepository.js";
import { MemoryAccommodationRepository } from "./MemoryAccommodationRepository.js";
import { MemorySessionRepository } from "./MemorySessionRepository.js";
import { MemoryQueries } from "./MemoryQueries.js";
import { MemoryNotifications } from "./MemoryNotifications.js";
import { MemoryUnitOfWork } from "./MemoryUnitOfWork.js";
import { testPasswordHasher } from "./testPasswordHasher.js";
import { testIdProvider } from "./testIdProvider.js";
import { CalendarDay } from "../domain/values/CalendarDay.js";
import type { DateProvider, Dependencies, Logger } from "../domain/ports.js";

// Tous nos tests s'exécutent indéfiniment le 12 juin 2023.
export const testDateProvider: DateProvider = {
  today: () => CalendarDay.parse("2023-06-12").value,
};

// Un test ne doit pas écrire dans la console.
export const testLogger: Logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

/**
 * Une FONCTION, pas un objet : chaque test repart d'un état vierge.
 * Sinon les réservations d'un test fuiteraient dans le suivant.
 */
export const testDependencies = (): Dependencies => {
  const accommodations = new MemoryAccommodationRepository();
  const bookings = new MemoryBookingRepository(accommodations);

  const dependencies: Omit<Dependencies, "unitOfWork"> & {
    unitOfWork?: Dependencies["unitOfWork"];
  } = {
    users: new MemoryUserRepository(),
    accommodations,
    bookings,
    sessions: new MemorySessionRepository(),
    queries: new MemoryQueries(bookings, accommodations),
    notifications: new MemoryNotifications(),
    dateProvider: testDateProvider,
    idProvider: testIdProvider(),
    passwords: testPasswordHasher,
    logger: testLogger,
  };

  // L'unité de travail reçoit le container qu'elle passera aux commandes.
  dependencies.unitOfWork = new MemoryUnitOfWork(dependencies as Dependencies);
  return dependencies as Dependencies;
};
