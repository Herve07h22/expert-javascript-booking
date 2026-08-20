import { it, expect } from "vitest";
import { App } from "../app/App.js";
import { testDependencies } from "../../infra/testDependencies.js";
import { login } from "../usecases/login.js";
import { authenticate } from "../usecases/authenticate.js";
import { book } from "../usecases/book.js";
import { cancelBooking } from "../usecases/cancelBooking.js";
import {
  UnknownBooking,
  BookingAlreadyCancelled,
  StayAlreadyStarted,
} from "../errorCodes.js";
import { listMyBookings } from "../usecases/listMyBookings.js";
import { bookingStatus } from "../entities/Booking.js";
import { Stay } from "../values/Stay.js";
import { App as AppType } from "../app/App.js";
import { errorCode, dataOf, stay } from "../../tests/helpers.js";



const bookOnce = async (app: AppType, payload: Record<string, unknown> = {}) =>
  app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
    book({
      accommodationId: "accommodation-1",
      adults: 2,
      children: 0,
      from: "2024-06-02",
      to: "2024-06-04",
      ...payload,
    }),
  ]);

it("A tenant can cancel a booking before it starts", async () => {
  const app = new App(testDependencies());
  const session = await bookOnce(app);

  const cancelled = await app.run([
    authenticate(session.token),
    cancelBooking({ bookingId: "booking-1" }),
  ]);
  expect(cancelled.error).toBeUndefined();

  // Le logement est de nouveau proposé sur la période
  const free = await app.dependencies.bookings.getAvailableAccommodations(
    stay("2024-06-02", "2024-06-04")
  );
  expect(free.some((a) => a.id === "accommodation-1")).toBe(true);

  // Mais la trace demeure
  const all = await app.dependencies.bookings.listBookingsForTenantId(
    "tenant-1"
  );
  expect(all).toHaveLength(1);
  expect(all[0]!.status).toBe(bookingStatus.cancelled);
});

it("A cancelled booking no longer blocks a new one", async () => {
  const app = new App(testDependencies());
  const session = await bookOnce(app);
  await app.run([
    authenticate(session.token),
    cancelBooking({ bookingId: "booking-1" }),
  ]);

  const again = await bookOnce(app);
  expect(again.error).toBeUndefined();
});

it("A tenant cannot cancel someone else's booking", async () => {
  const app = new App(testDependencies());
  await bookOnce(app);

  const other = await app.run([
    login({ email: "otherguest@mail.com", password: "secret" }),
    cancelBooking({ bookingId: "booking-1" }),
  ]);

  // On ne confirme pas l'existence d'une ressource à qui n'y a pas droit.
  expect(errorCode(other)).toBe(UnknownBooking("booking-1").code);
});

it("A tenant cannot cancel twice", async () => {
  const app = new App(testDependencies());
  const session = await bookOnce(app);

  await app.run([
    authenticate(session.token),
    cancelBooking({ bookingId: "booking-1" }),
  ]);
  const twice = await app.run([
    authenticate(session.token),
    cancelBooking({ bookingId: "booking-1" }),
  ]);

  expect(errorCode(twice)).toBe(BookingAlreadyCancelled("booking-1").code);
});

it("A tenant cannot cancel a stay that has already started", async () => {
  const app = new App(testDependencies());
  const session = await bookOnce(app, { from: "2023-06-22", to: "2023-06-25" });

  // On avance l'horloge : le séjour a commencé.
  app.dependencies.dateProvider.today = () =>
    Stay.parse({ from: "2023-06-23", to: "2023-06-24" }).value.from;

  const late = await app.run([
    authenticate(session.token),
    cancelBooking({ bookingId: "booking-1" }),
  ]);
  expect(errorCode(late)).toBe(StayAlreadyStarted("booking-1").code);
});

it("A tenant lists their own bookings, with everything the screen needs", async () => {
  const app = new App(testDependencies());
  const session = await bookOnce(app);

  const context = await app.run([
    authenticate(session.token),
    listMyBookings(),
  ]);

  const rows = dataOf<Record<string, unknown>[]>(context);
  expect(rows).toHaveLength(1);
  expect(rows[0]).toEqual({
    id: "booking-1",
    status: "confirmed",
    cancellable: true,
    accommodationId: "accommodation-1",
    name: "Villa 6 pièces avec piscine",
    location: "Saint-Rémy-de-Provence",
    imageUrl: "https://picsum.photos/seed/accommodation-1/400/300",
    from: "2024-06-02",
    to: "2024-06-04",
    nights: 2,
    guests: 2,
    price: 460,
  });
  // Une vue ne transporte aucun objet du domaine.
  expect(typeof rows[0]!.from).toBe("string");
});

it("An anonymous visitor lists nothing", async () => {
  const app = new App(testDependencies());
  const context = await app.run([listMyBookings()]);

  expect(errorCode(context)).toBe("SHOULD_BE_LOGGED");
  expect(context.data).toBeUndefined();
});
