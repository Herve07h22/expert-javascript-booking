import { it, expect } from "vitest";
import { App } from "../app/App.js";
import { testDependencies } from "../../infra/testDependencies.js";
import { login } from "../usecases/login.js";
import { book } from "../usecases/book.js";
import {
  StayMustStartInTheFuture,
  UnknownAccommodation,
  AccommodationTooSmall,
  AccommodationNotAvailable,
  NeedsAtLeastOneAdult,
  StayMustLastAtLeastOneNight,
} from "../errorCodes.js";
import { Stay } from "../values/Stay.js";
import { Occupancy } from "../values/Occupancy.js";
import { CalendarDay } from "../values/CalendarDay.js";

// Notre provider de test est figé au 12 juin 2023.
const today = CalendarDay.parse("2023-06-12").value;
const stay = (from, to) => Stay.parse({ from, to }).value;

it("A tenant can book an accommodation", async () => {
  // Injection des dépendances
  const app = new App(testDependencies());

  // Réalisation de la location
  await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
    book({
      accommodationId: "accommodation-1",
      adults: 2,
      children: 3,
      from: "2024-06-02",
      to: "2024-06-04",
    }),
  ]);

  // Le calendrier comporte la réservation
  const bookings =
    await app.dependencies.bookings.listBookingsForAccommodationId(
      "accommodation-1"
    );
  expect(bookings).toHaveLength(1);
  expect(bookings[0].stay.nights).toBe(2);
  expect(bookings[0].guests.total).toBe(5);
});

it("A tenant cannot book an accommodation in the past", async () => {
  const app = new App(testDependencies());

  const session = await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
    book({
      accommodationId: "accommodation-1",
      adults: 2,
      children: 3,
      from: "2023-06-02", // Sûr d'être dans le passé
      to: "2023-06-04",
    }),
  ]);

  expect(session.error.code).toBe(StayMustStartInTheFuture(today).code);
});

it("A tenant cannot book for the very same day : one day notice", async () => {
  const app = new App(testDependencies());

  const session = await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
    book({
      accommodationId: "accommodation-1",
      adults: 2,
      children: 3,
      from: "2023-06-12", // Aujourd'hui
      to: "2023-06-14",
    }),
  ]);

  expect(session.error.code).toBe(StayMustStartInTheFuture(today).code);
});

it("A stay must last at least one night", async () => {
  const app = new App(testDependencies());

  const session = await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
    book({
      accommodationId: "accommodation-1",
      adults: 2,
      children: 3,
      from: "2023-06-22",
      to: "2023-06-22", // Non respect d'une nuitée mini
    }),
  ]);

  expect(session.error).toEqual(
    StayMustLastAtLeastOneNight(
      CalendarDay.parse("2023-06-22").value,
      CalendarDay.parse("2023-06-22").value
    )
  );
});

it("A booking needs at least one adult", async () => {
  const app = new App(testDependencies());

  const session = await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
    book({
      accommodationId: "accommodation-1",
      adults: 0,
      children: 3,
      from: "2024-06-02",
      to: "2024-06-04",
    }),
  ]);

  expect(session.error.code).toBe(NeedsAtLeastOneAdult(0).code);
});

it("An anonymous visitor cannot book", async () => {
  const app = new App(testDependencies());

  const session = await app.run([
    book({
      accommodationId: "accommodation-1",
      adults: 2,
      children: 3,
      from: "2024-06-02",
      to: "2024-06-04",
    }),
  ]);

  expect(session.error.code).toBe("SHOULD_BE_LOGGED");
  const bookings =
    await app.dependencies.bookings.listBookingsForAccommodationId(
      "accommodation-1"
    );
  expect(bookings).toHaveLength(0);
});

it("A tenant sees the list of available accommodations", async () => {
  const app = new App(testDependencies());

  await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
    book({
      accommodationId: "accommodation-1",
      adults: 2,
      children: 3,
      from: "2024-06-02",
      to: "2024-06-04",
    }),
  ]);

  const bookings =
    await app.dependencies.bookings.listBookingsForAccommodationId(
      "accommodation-1"
    );
  expect(bookings).toHaveLength(1);

  const bookingsOfTenant =
    await app.dependencies.bookings.listBookingsForTenantId("tenant-1");
  expect(bookingsOfTenant[0]).toBe(bookings[0]); // la même réservation, la même référence

  // Requête sur une période qui recouvre la réservation
  const during = await app.dependencies.bookings.getAvailableAccommodations(
    stay("2024-06-01", "2024-06-03")
  );
  expect(during.some((a) => a.id === "accommodation-1")).toBe(false);

  // Requête sur une période sans réservation
  const free = await app.dependencies.bookings.getAvailableAccommodations(
    stay("2024-05-12", "2024-05-15")
  );
  expect(free.some((a) => a.id === "accommodation-1")).toBe(true);

  // Rotation : le vacancier suivant peut arriver le jour du départ
  const turnover = await app.dependencies.bookings.getAvailableAccommodations(
    stay("2024-06-04", "2024-06-06")
  );
  expect(turnover.some((a) => a.id === "accommodation-1")).toBe(true);
});

it("A tenant cannot book an accommodation that does not exist", async () => {
  const app = new App(testDependencies());

  const session = await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
    book({
      accommodationId: "accommodation-42",
      adults: 2,
      children: 0,
      from: "2024-06-02",
      to: "2024-06-04",
    }),
  ]);

  expect(session.error.code).toBe(UnknownAccommodation("accommodation-42").code);
});

it("A tenant cannot book an accommodation that is too small", async () => {
  const app = new App(testDependencies());

  const session = await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
    book({
      accommodationId: "accommodation-3", // capacité : 2
      adults: 2,
      children: 3,
      from: "2024-06-02",
      to: "2024-06-04",
    }),
  ]);

  expect(session.error).toEqual(
    AccommodationTooSmall("accommodation-3", 2, 5)
  );
});

it("The list of available accommodations excludes those that are too small", async () => {
  const app = new App(testDependencies());
  const guests = Occupancy.of({ adults: 2, children: 3 }).value;

  const available =
    await app.dependencies.bookings.getAvailableAccommodations(
      stay("2024-06-02", "2024-06-04"),
      guests
    );

  expect(available.some((a) => a.id === "accommodation-1")).toBe(true); // capacité 8
  expect(available.some((a) => a.id === "accommodation-3")).toBe(false); // capacité 2
});

it("A tenant cannot book an accommodation already booked", async () => {
  const app = new App(testDependencies());

  await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
    book({
      accommodationId: "accommodation-1",
      adults: 2,
      children: 0,
      from: "2024-06-02",
      to: "2024-06-04",
    }),
  ]);

  // Cette seconde réservation recouvre la première
  const session = await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
    book({
      accommodationId: "accommodation-1",
      adults: 2,
      children: 0,
      from: "2024-06-03",
      to: "2024-06-06",
    }),
  ]);

  expect(session.error.code).toBe(AccommodationNotAvailable("accommodation-1").code);

  // Ce qui compte n'est pas le message : c'est que l'état n'ait pas bougé.
  const bookings =
    await app.dependencies.bookings.listBookingsForAccommodationId(
      "accommodation-1"
    );
  expect(bookings).toHaveLength(1);
});

it("A tenant can book the very day the previous one leaves", async () => {
  const app = new App(testDependencies());

  await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
    book({
      accommodationId: "accommodation-1",
      adults: 2,
      children: 0,
      from: "2024-06-02",
      to: "2024-06-04",
    }),
  ]);

  const session = await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
    book({
      accommodationId: "accommodation-1",
      adults: 2,
      children: 0,
      from: "2024-06-04", // arrivée le jour du départ
      to: "2024-06-06",
    }),
  ]);

  expect(session.error).toBeUndefined();
});

// Le it.fails du chapitre 29 est devenu un it : l'unité de travail sérialise
// les scénarios. Le remède n'était pas dans le domaine.
it("Two simultaneous bookings : only one is accepted", async () => {
  const app = new App(testDependencies());

  await Promise.all([
    app.run([
      login({ email: "faketenant@mail.com", password: "secret" }),
      book({
        accommodationId: "accommodation-1",
        adults: 2,
        children: 0,
        from: "2024-06-02",
        to: "2024-06-04",
      }),
    ]),
    app.run([
      login({ email: "faketenant@mail.com", password: "secret" }),
      book({
        accommodationId: "accommodation-1",
        adults: 2,
        children: 0,
        from: "2024-06-02",
        to: "2024-06-04",
      }),
    ]),
  ]);

  const bookings =
    await app.dependencies.bookings.listBookingsForAccommodationId(
      "accommodation-1"
    );
  expect(bookings).toHaveLength(1);
});
