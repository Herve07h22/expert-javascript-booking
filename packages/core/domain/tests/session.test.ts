import { it, expect } from "vitest";
import { App } from "../app/App.js";
import { testDependencies } from "../../infra/testDependencies.js";
import { login } from "../usecases/login.js";
import { InvalidCredentials } from "../errorCodes.js";
import { authenticate } from "../usecases/authenticate.js";
import { InvalidSession } from "../errorCodes.js";
import { logout } from "../usecases/logout.js";
import { book } from "../usecases/book.js";
import { errorCode } from "../../tests/helpers.js";

const aBooking = {
  accommodationId: "accommodation-1",
  adults: 2,
  children: 0,
  from: "2024-06-02",
  to: "2024-06-04",
};

it("A logged in tenant gets a session token, and can reuse it later", async () => {
  const app = new App(testDependencies());

  // Première exécution : je m'authentifie
  const logged = await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
  ]);
  expect(logged.error).toBeUndefined();
  expect(logged.token).toBeDefined();

  // Deuxième exécution, plus tard : je présente mon jeton, pas mon mot de passe
  const session = await app.run([authenticate(logged.token), book(aBooking)]);
  expect(session.error).toBeUndefined();

  const bookings = await app.dependencies.bookings.listBookingsForTenantId(
    "tenant-1"
  );
  expect(bookings).toHaveLength(1);
});

it("An invalid token books nothing", async () => {
  const app = new App(testDependencies());

  const session = await app.run([
    authenticate("je-suis-un-pirate"),
    book(aBooking),
  ]);

  expect(errorCode(session)).toBe(InvalidSession().code);
  // Le fusible du chapitre 13 : book() n'a même pas été exécutée.
  const bookings = await app.dependencies.bookings.listBookingsForTenantId(
    "tenant-1"
  );
  expect(bookings).toHaveLength(0);
});

it("A wrong password and an unknown email give the very same error", async () => {
  const app = new App(testDependencies());

  const unknown = await app.run([
    login({ email: "personne@mail.com", password: "secret" }),
  ]);
  const wrong = await app.run([
    login({ email: "faketenant@mail.com", password: "oups" }),
  ]);

  expect(errorCode(unknown)).toBe(InvalidCredentials().code);
  expect(errorCode(wrong)).toBe(InvalidCredentials().code);
});

it("Logging out invalidates the token on the server", async () => {
  const app = new App(testDependencies());

  const logged = await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
  ]);
  await app.run([logout(logged.token)]);

  const session = await app.run([authenticate(logged.token), book(aBooking)]);
  expect(errorCode(session)).toBe(InvalidSession().code);
});

it("What leaves the domain never carries the hashed password", async () => {
  const app = new App(testDependencies());

  const logged = await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
  ]);

  expect(logged.session().currentUser).toEqual({
    id: "tenant-1",
    email: "faketenant@mail.com",
  });
  expect(JSON.stringify(logged.session())).not.toContain("hashed");
});
