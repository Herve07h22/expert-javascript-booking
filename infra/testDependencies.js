import { MemoryUserRepository } from "./MemoryUserRepository";
import { MemoryBookingRepository } from "./MemoryBookingRepository";

export const testDependencies = () => ({
  users: new MemoryUserRepository(),
  bookings: new MemoryBookingRepository(),
});
