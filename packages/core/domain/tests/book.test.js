import { it, expect } from "vitest";
import { App } from "../app/App";
import { testDependencies } from "../../infra/testDependencies";
import { login } from "../usecases/login";
import { book } from "../usecases/book";

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
      to: new Date("2024-06-02"),
    }),
  ]);

  // Le calendrier comporte la réservation
  const bookings =
    await app.dependencies.bookings.listBookingsForAccomodationId(
      "accomodation-1"
    );
  expect(bookings).toHaveLength(1);
});
