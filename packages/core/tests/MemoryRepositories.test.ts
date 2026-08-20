import { describe } from "vitest";
import { bookingRepositoryContract } from "./contracts/bookingRepository.contract.js";
import { userRepositoryContract } from "./contracts/userRepository.contract.js";
import { MemoryBookingRepository } from "../infra/MemoryBookingRepository.js";
import { MemoryAccommodationRepository } from "../infra/MemoryAccommodationRepository.js";
import { MemoryUserRepository } from "../infra/MemoryUserRepository.js";

describe("MemoryBookingRepository", () => {
  bookingRepositoryContract(
    async () => new MemoryBookingRepository(new MemoryAccommodationRepository())
  );
});

describe("MemoryUserRepository", () => {
  userRepositoryContract(async () => new MemoryUserRepository());
});
