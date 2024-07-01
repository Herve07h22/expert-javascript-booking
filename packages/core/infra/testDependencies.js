import { MemoryUserRepository } from "./MemoryUserRepository";
import { MemoryBookingRepository } from "./MemoryBookingRepository";
import { systemDateProvider } from "./systemDateProvider";

const testDateProvider = {
  ...systemDateProvider,
  now: () => new Date("2023-06-12"),
};

export const testDependencies = () => ({
  users: new MemoryUserRepository(),
  bookings: new MemoryBookingRepository(),
  dateProvider: testDateProvider,
});
