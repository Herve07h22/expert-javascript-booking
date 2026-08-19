import { MemoryUserRepository } from "./MemoryUserRepository.js";
import { MemoryBookingRepository } from "./MemoryBookingRepository.js";
import { MemoryAccommodationRepository } from "./MemoryAccommodationRepository.js";
import { MemorySessionRepository } from "./MemorySessionRepository.js";
import { MemoryQueries } from "./MemoryQueries.js";
import { testPasswordHasher } from "./testPasswordHasher.js";
import { testIdProvider } from "./testIdProvider.js";
import { CalendarDay } from "../domain/values/CalendarDay.js";

// Tous nos tests s'exécutent indéfiniment le 12 juin 2023.
export const testDateProvider = {
  today: () => CalendarDay.parse("2023-06-12").value,
};

export const testDependencies = () => {
  const accommodations = new MemoryAccommodationRepository();
  const bookings = new MemoryBookingRepository(accommodations);
  return {
    users: new MemoryUserRepository(),
    accommodations,
    bookings,
    sessions: new MemorySessionRepository(),
    queries: new MemoryQueries(bookings, accommodations),
    dateProvider: testDateProvider,
    idProvider: testIdProvider(),
    passwords: testPasswordHasher,
  };
};
