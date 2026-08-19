import { describe, beforeAll, afterAll, beforeEach, it, expect } from "vitest";
import { bookingRepositoryContract } from "./contracts/bookingRepository.contract.js";
import { userRepositoryContract } from "./contracts/userRepository.contract.js";
import { testDatabase } from "./testDatabase.js";
import { SQLBookingRepository } from "../infra/SQLBookingRepository.js";
import { SQLUserRepository } from "../infra/SQLUserRepository.js";
import { Booking, bookingStatus } from "../domain/entities/Booking.js";
import { Stay } from "../domain/values/Stay.js";
import { Occupancy } from "../domain/values/Occupancy.js";
import { AccommodationNotAvailable } from "../domain/usecases/book.js";

// Sans base, la suite ne ment pas : elle dit qu'elle n'a rien vérifié.
const withDatabase = process.env.TEST_DATABASE_URL ? describe : describe.skip;

withDatabase("SQL repositories", () => {
  const db = testDatabase();

  beforeAll(() => db.migrate());
  afterAll(() => db.close());

  describe("SQLBookingRepository", () => {
    bookingRepositoryContract(async () => {
      await db.reset();
      return new SQLBookingRepository(db.pool);
    });
  });

  describe("SQLUserRepository", () => {
    userRepositoryContract(async () => {
      await db.reset();
      return new SQLUserRepository(db.pool);
    });
  });

  describe("la contrainte d'exclusion", () => {
    beforeEach(() => db.reset());

    const stay = (from, to) => Stay.parse({ from, to }).value;
    const guests = Occupancy.of({ adults: 2, children: 0 }).value;
    const aBooking = (id, from, to) =>
      new Booking({
        id,
        tenantId: "tenant-1",
        accommodationId: "accommodation-1",
        guests,
        stay: stay(from, to),
        status: bookingStatus.confirmed,
      });

    it("refuse deux réservations qui se recouvrent, même sans contrôle applicatif", async () => {
      const repository = new SQLBookingRepository(db.pool);
      await repository.save(aBooking("booking-1", "2024-06-02", "2024-06-04"));

      // On court-circuite volontairement findOverlapping : c'est le moteur
      // qui doit tenir l'invariant, y compris contre le code qu'on n'a pas écrit.
      await expect(
        repository.save(aBooking("booking-2", "2024-06-03", "2024-06-06"))
      ).rejects.toThrowError(AccommodationNotAvailable("accommodation-1"));
    });

    it("autorise la rotation le jour du départ", async () => {
      const repository = new SQLBookingRepository(db.pool);
      await repository.save(aBooking("booking-1", "2024-06-02", "2024-06-04"));

      await expect(
        repository.save(aBooking("booking-2", "2024-06-04", "2024-06-06"))
      ).resolves.toBeUndefined();
    });

    it("ne bloque pas sur une réservation annulée", async () => {
      const repository = new SQLBookingRepository(db.pool);
      const first = aBooking("booking-1", "2024-06-02", "2024-06-04");
      await repository.save(first);
      await repository.save(first.cancel());

      await expect(
        repository.save(aBooking("booking-2", "2024-06-02", "2024-06-04"))
      ).resolves.toBeUndefined();
    });
  });

  describe("le pilote pg", () => {
    beforeEach(() => db.reset());

    it("rend les colonnes date en chaîne, pas en objet Date", async () => {
      const { rows } = await db.pool.query(
        `select '2024-06-02'::date as day`
      );
      // Sans configurePgTypes, ce serait un objet Date à minuit local :
      // un serveur en UTC+2 relirait le 1er juin 22h UTC.
      expect(rows[0].day).toBe("2024-06-02");
    });
  });
});
