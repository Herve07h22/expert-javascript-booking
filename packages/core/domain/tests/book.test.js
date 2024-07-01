import { it, expect } from "vitest";
import { App } from "../app/App";
import { testDependencies } from "../../infra/testDependencies";
import { login } from "../usecases/login";
import { book } from "../usecases/book";
import { InvalidInterval } from "../usecases/book";
import { toDate, isOverlapped } from "../app/dates";

it("A tenant can book an accomodation", async () => {
  // Injection des dépendances
  const app = new App(testDependencies());

  // Réalisation de la location
  await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
    book({
      accomodationId: "accomodation-1",
      adults: 2,
      children: 3,
      from: new Date("2024-06-02"),
      to: new Date("2024-06-04"),
    }),
  ]);

  // Le calendrier comporte la réservation
  const bookings =
    await app.dependencies.bookings.listBookingsForAccomodationId(
      "accomodation-1"
    );
  expect(bookings).toHaveLength(1);
});

it("A tenant cannot book an accomodation int he past", async () => {
  const app = new App(testDependencies());

  // Tentative de réservation dans le passé
  const session = await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
    book({
      accomodationId: "accomodation-1",
      adults: 2,
      children: 3,
      from: new Date("2023-06-02"), // Sûr d'être dans le passé
      to: new Date("2023-06-02"),
    }),
  ]);

  expect(session.error).toEqual(InvalidInterval());
});

it("A tenant should provide a valid interval", async () => {
  const app = new App(testDependencies());

  // Tentative de réservation dans le passé
  const session = await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
    book({
      accomodationId: "accomodation-1",
      adults: 2,
      children: 3,
      from: new Date("2023-06-22"), // Dans le futur (notre provider de test est figé au 12 juin 2023)
      to: new Date("2023-06-12"), // Oups..
    }),
  ]);

  expect(session.error).toEqual(InvalidInterval());
});

it("A tenant see the list of available accomodations", async () => {
  const app = new App(testDependencies());

  await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
    book({
      accomodationId: "accomodation-1",
      adults: 2,
      children: 3,
      from: new Date("2024-06-02"),
      to: new Date("2024-06-04"),
    }),
  ]);

  const bookings =
    await app.dependencies.bookings.listBookingsForAccomodationId(
      "accomodation-1"
    );
  expect(bookings).toHaveLength(1);

  const bookingsOfTenant =
    await app.dependencies.bookings.listBookingsForTenantId("tenant-1");
  expect(bookingsOfTenant[0]).toEqual(bookings[0]); // on parle de la même réservation que précédemment

  // Requête sur une période comportant déjà une réservation
  const unavailableAccomodations =
    await app.dependencies.bookings.getAvailableAccomodations({
      from: toDate("2024-06-01"),
      to: toDate("2024-06-03"),
    });
  expect(
    unavailableAccomodations.some(
      (accomodation) => accomodation.id === "accomodation-1"
    )
  ).toBe(false);

  // Requête sur une période sans réservation
  const availableAccomodations =
    await app.dependencies.bookings.getAvailableAccomodations({
      from: toDate("2024-05-12"),
      to: toDate("2024-05-15"),
    });
    expect(
    availableAccomodations.some(
      (accomodation) => accomodation.id === "accomodation-1"
    )
  ).toBe(true);
});

it("Can compute overlapping", () => {
  expect(
    isOverlapped(
      { from: toDate("2024-06-12"), to: toDate("2024-06-15") },
      { from: toDate("2024-05-12"), to: toDate("2024-05-15") }
    )
  ).toBe(false);

  expect(
    isOverlapped(
      { from: toDate("2024-06-12"), to: toDate("2024-06-15") },
      { from: toDate("2024-06-14"), to: toDate("2024-06-17") }
    )
  ).toBe(true);
});
