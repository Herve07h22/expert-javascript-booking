import { MemoryUserRepository } from "./MemoryUserRepository.js";
import { MemoryBookingRepository } from "./MemoryBookingRepository.js";
import { CalendarDay } from "../domain/values/CalendarDay.js";

// Tous nos tests s'exécutent indéfiniment le 12 juin 2023.
export const testDateProvider = {
  today: () => CalendarDay.parse("2023-06-12").value,
};

export const testDependencies = () => ({
  users: new MemoryUserRepository(),
  bookings: new MemoryBookingRepository(),
  dateProvider: testDateProvider,
});
