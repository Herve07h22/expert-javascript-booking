import { MemoryUserRepository } from "./MemoryUserRepository.js";
import { MemoryBookingRepository } from "./MemoryBookingRepository.js";
import { MemoryAccommodationRepository } from "./MemoryAccommodationRepository.js";
import { CalendarDay } from "../domain/values/CalendarDay.js";

// Tous nos tests s'exécutent indéfiniment le 12 juin 2023.
export const testDateProvider = {
  today: () => CalendarDay.parse("2023-06-12").value,
};

export const testDependencies = () => {
  const accommodations = new MemoryAccommodationRepository();
  return {
    users: new MemoryUserRepository(),
    accommodations,
    bookings: new MemoryBookingRepository(accommodations),
    dateProvider: testDateProvider,
  };
};
