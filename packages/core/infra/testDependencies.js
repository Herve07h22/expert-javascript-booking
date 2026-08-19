import { MemoryUserRepository } from "./MemoryUserRepository.js";
import { MemoryBookingRepository } from "./MemoryBookingRepository.js";
import { MemoryAccommodationRepository } from "./MemoryAccommodationRepository.js";
import { MemorySessionRepository } from "./MemorySessionRepository.js";
import { MemoryQueries } from "./MemoryQueries.js";
import { testPasswordHasher } from "./testPasswordHasher.js";
import { testIdProvider } from "./testIdProvider.js";
import { MemoryNotifications } from "./MemoryNotifications.js";
import { MemoryUnitOfWork } from "./MemoryUnitOfWork.js";
import { CalendarDay } from "../domain/values/CalendarDay.js";

// Un logger silencieux : un test ne doit pas écrire dans la console.
export const testLogger = {
  info: () => {},
  error: () => {},
};

// Tous nos tests s'exécutent indéfiniment le 12 juin 2023.
export const testDateProvider = {
  today: () => CalendarDay.parse("2023-06-12").value,
};

export const testDependencies = () => {
  const accommodations = new MemoryAccommodationRepository();
  const bookings = new MemoryBookingRepository(accommodations);
  const dependencies = {
    users: new MemoryUserRepository(),
    accommodations,
    bookings,
    sessions: new MemorySessionRepository(),
    queries: new MemoryQueries(bookings, accommodations),
    dateProvider: testDateProvider,
    idProvider: testIdProvider(),
    passwords: testPasswordHasher,
    notifications: new MemoryNotifications(),
    logger: testLogger,
  };
  // L'unité de travail reçoit le container qu'elle passera aux commandes.
  dependencies.unitOfWork = new MemoryUnitOfWork(dependencies);
  return dependencies;
};
