import { it, expect, describe, beforeEach } from "vitest";
import { Booking, bookingStatus } from "../../domain/entities/Booking.js";
import { Stay } from "../../domain/values/Stay.js";
import { Occupancy } from "../../domain/values/Occupancy.js";

const stay = (from, to) => Stay.parse({ from, to }).value;
const guests = Occupancy.of({ adults: 2, children: 0 }).value;

const aBooking = (id, from, to, status = bookingStatus.confirmed) =>
  new Booking({
    id,
    tenantId: "tenant-1",
    accommodationId: "accommodation-1",
    guests,
    stay: stay(from, to),
    status,
  });

/**
 * Le contrat que doit tenir N'IMPORTE QUEL BookingRepository.
 *
 * Aucune assertion ne parle de tableau, de Map, de select ou de Pool :
 * un test de contrat décrit un comportement observable, jamais une
 * implémentation. S'il connaît `_bookings`, il ne tourne plus contre SQL.
 *
 * @param makeRepository une fonction qui retourne un repository vide
 */
export function bookingRepositoryContract(makeRepository) {
  let repository;
  beforeEach(async () => {
    repository = await makeRepository();
  });

  describe("save / findById", () => {
    it("retourne null quand rien ne correspond", async () => {
      expect(await repository.findById("booking-404")).toBe(null);
    });

    it("relit une réservation identique à celle enregistrée", async () => {
      await repository.save(aBooking("booking-1", "2024-06-02", "2024-06-04"));
      const found = await repository.findById("booking-1");

      expect(found.id).toBe("booking-1");
      expect(found.tenantId).toBe("tenant-1");
      expect(found.stay.from.toString()).toBe("2024-06-02");
      expect(found.stay.to.toString()).toBe("2024-06-04");
      expect(found.stay.nights).toBe(2);
      expect(found.guests.total).toBe(2);
      expect(found.isActive()).toBe(true);
    });

    it("met à jour au lieu de dupliquer", async () => {
      const booking = aBooking("booking-1", "2024-06-02", "2024-06-04");
      await repository.save(booking);
      await repository.save(booking.cancel());

      const all = await repository.listBookingsForTenantId("tenant-1");
      expect(all).toHaveLength(1);
      expect(all[0].status).toBe(bookingStatus.cancelled);
    });
  });

  describe("listBookings", () => {
    it("retourne une liste vide, jamais null", async () => {
      expect(await repository.listBookingsForTenantId("tenant-1")).toEqual([]);
      expect(
        await repository.listBookingsForAccommodationId("accommodation-1")
      ).toEqual([]);
    });

    it("ne mélange pas les locataires", async () => {
      await repository.save(aBooking("booking-1", "2024-06-02", "2024-06-04"));
      expect(await repository.listBookingsForTenantId("tenant-2")).toEqual([]);
    });
  });

  describe("findOverlapping", () => {
    beforeEach(async () => {
      await repository.save(aBooking("booking-1", "2024-06-02", "2024-06-04"));
    });

    it("trouve un chevauchement partiel", async () => {
      const found = await repository.findOverlapping(
        "accommodation-1",
        stay("2024-06-03", "2024-06-06")
      );
      expect(found).toHaveLength(1);
    });

    it("trouve une inclusion", async () => {
      const found = await repository.findOverlapping(
        "accommodation-1",
        stay("2024-06-01", "2024-06-10")
      );
      expect(found).toHaveLength(1);
    });

    it("autorise la rotation le jour du départ", async () => {
      const found = await repository.findOverlapping(
        "accommodation-1",
        stay("2024-06-04", "2024-06-06")
      );
      expect(found).toHaveLength(0);
    });

    it("autorise la rotation le jour de l'arrivée", async () => {
      const found = await repository.findOverlapping(
        "accommodation-1",
        stay("2024-05-30", "2024-06-02")
      );
      expect(found).toHaveLength(0);
    });

    it("laisse passer une période disjointe", async () => {
      const found = await repository.findOverlapping(
        "accommodation-1",
        stay("2024-05-12", "2024-05-15")
      );
      expect(found).toHaveLength(0);
    });

    it("ignore un autre logement", async () => {
      const found = await repository.findOverlapping(
        "accommodation-2",
        stay("2024-06-03", "2024-06-06")
      );
      expect(found).toHaveLength(0);
    });

    it("ignore les réservations annulées", async () => {
      await repository.save(
        aBooking("booking-1", "2024-06-02", "2024-06-04").cancel()
      );
      const found = await repository.findOverlapping(
        "accommodation-1",
        stay("2024-06-03", "2024-06-06")
      );
      expect(found).toHaveLength(0);
    });
  });

  describe("getAvailableAccommodations", () => {
    it("retire le logement réservé sur la période", async () => {
      await repository.save(aBooking("booking-1", "2024-06-02", "2024-06-04"));
      const available = await repository.getAvailableAccommodations(
        stay("2024-06-01", "2024-06-03")
      );
      expect(available.some((a) => a.id === "accommodation-1")).toBe(false);
    });

    it("le propose de nouveau une fois la réservation annulée", async () => {
      const booking = aBooking("booking-1", "2024-06-02", "2024-06-04");
      await repository.save(booking);
      await repository.save(booking.cancel());

      const available = await repository.getAvailableAccommodations(
        stay("2024-06-01", "2024-06-03")
      );
      expect(available.some((a) => a.id === "accommodation-1")).toBe(true);
    });

    it("écarte les logements trop petits", async () => {
      const family = Occupancy.of({ adults: 2, children: 3 }).value;
      const available = await repository.getAvailableAccommodations(
        stay("2024-06-02", "2024-06-04"),
        family
      );
      expect(available.some((a) => a.id === "accommodation-1")).toBe(true); // capacité 8
      expect(available.some((a) => a.id === "accommodation-3")).toBe(false); // capacité 2
    });

    it("retourne tout le catalogue sans occupation demandée", async () => {
      const available = await repository.getAvailableAccommodations(
        stay("2024-06-02", "2024-06-04")
      );
      expect(available).toHaveLength(6);
    });
  });
}
