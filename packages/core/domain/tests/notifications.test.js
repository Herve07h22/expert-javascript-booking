import { it, expect } from "vitest";
import { App } from "../app/App.js";
import { testDependencies } from "../../infra/testDependencies.js";
import { subscribers } from "../../infra/subscribers.js";
import { login } from "../usecases/login.js";
import { authenticate } from "../usecases/authenticate.js";
import { book } from "../usecases/book.js";
import { cancelBooking } from "../usecases/cancelBooking.js";

const aBooking = {
  accommodationId: "accommodation-1", // propriétaire : host-1, claire@mail.com
  adults: 2,
  children: 0,
  from: "2024-06-02",
  to: "2024-06-04",
};

it("Both the tenant and the host are notified of a new booking", async () => {
  const app = new App(testDependencies(), subscribers);

  await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
    book(aBooking),
  ]);

  const { sent } = app.dependencies.notifications;
  expect(sent).toHaveLength(2);

  // On ne vérifie pas le contenu du mail : on vérifie qu'une INTENTION
  // a été émise, aux bonnes personnes, avec les bonnes données.
  expect(sent[0]).toEqual({
    type: "BookingConfirmed",
    to: "faketenant@mail.com",
    payload: {
      bookingId: "booking-1",
      tenantId: "tenant-1",
      accommodationId: "accommodation-1",
      from: "2024-06-02",
      to: "2024-06-04",
      guests: 2,
    },
  });
  expect(sent[1].to).toBe("claire@mail.com");
});

it("Nothing is published when the scenario fails", async () => {
  const app = new App(testDependencies(), subscribers);

  const session = await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
    book({ ...aBooking, accommodationId: "accommodation-42" }),
  ]);

  expect(session.error).toBeDefined();
  expect(app.dependencies.notifications.sent).toHaveLength(0);
});

it("A cancellation notifies both parties too", async () => {
  const app = new App(testDependencies(), subscribers);

  const session = await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
    book(aBooking),
  ]);
  await app.run([
    authenticate(session.token),
    cancelBooking({ bookingId: "booking-1" }),
  ]);

  const { sent } = app.dependencies.notifications;
  expect(sent).toHaveLength(4);
  expect(sent[2].type).toBe("BookingCancelled");
  expect(sent[3].type).toBe("BookingCancelled");
});

it("A failing subscriber does not undo what has been done", async () => {
  const dependencies = testDependencies();
  const app = new App(dependencies, {
    BookingConfirmed: [
      async () => {
        throw new Error("SMTP is down");
      },
    ],
  });

  const session = await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
    book(aBooking),
  ]);

  expect(session.error).toBeUndefined();
  const bookings = await dependencies.bookings.listBookingsForTenantId(
    "tenant-1"
  );
  expect(bookings).toHaveLength(1);
});

it("An event carries an id, so it can be replayed without damage", async () => {
  const app = new App(testDependencies(), subscribers);

  const session = await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
    book(aBooking),
  ]);

  expect(session.events).toHaveLength(1);
  expect(session.events[0].id).toBe("event-1");
  // Un événement est fait pour voyager : il doit survivre à JSON.stringify.
  expect(JSON.parse(JSON.stringify(session.events[0]))).toEqual(
    session.events[0]
  );
});
