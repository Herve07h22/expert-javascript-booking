import { it, expect, describe, beforeEach } from "vitest";
import request from "supertest";
import type { Express } from "express";
import { App, testDependencies, subscribers } from "@booking/core";
import { createServer } from "../src/createServer.js";

const silentLogger = { debug() {}, info() {}, warn() {}, error() {} };

const credentials = { email: "faketenant@mail.com", password: "secret" };
const aBooking = {
  accommodationId: "accommodation-1",
  adults: 2,
  children: 0,
  from: "2024-06-02",
  to: "2024-06-04",
};

describe("l'API", () => {
  let server: Express;

  beforeEach(() => {
    const app = new App(testDependencies(), subscribers);
    server = createServer(app, { logger: silentLogger });
  });

  const logIn = async () => {
    const response = await request(server)
      .post("/api/sessions")
      .send(credentials)
      .expect(200);
    return response.headers["set-cookie"] as unknown as string[];
  };

  it("pose un cookie de session HttpOnly", async () => {
    const response = await request(server)
      .post("/api/sessions")
      .send(credentials)
      .expect(200);

    const cookie = (response.headers["set-cookie"] as unknown as string[])[0] as string;
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    // Le corps ne transporte que ce qui est affichable.
    expect(response.body.data).toEqual({
      id: "tenant-1",
      email: "faketenant@mail.com",
    });
    expect(JSON.stringify(response.body)).not.toContain("hashed");
  });

  it("répond 401 sur des identifiants faux, sans dire lequel", async () => {
    const unknown = await request(server)
      .post("/api/sessions")
      .send({ email: "personne@mail.com", password: "secret" })
      .expect(401);
    const wrong = await request(server)
      .post("/api/sessions")
      .send({ email: "faketenant@mail.com", password: "oups" })
      .expect(401);

    expect(unknown.body.error.code).toBe("INVALID_CREDENTIALS");
    expect(wrong.body.error.code).toBe(unknown.body.error.code);
  });

  it("refuse une réservation sans session", async () => {
    const response = await request(server)
      .post("/api/bookings")
      .send(aBooking)
      .expect(401);
    expect(response.body.error.code).toBe("INVALID_SESSION");
  });

  it("réserve, puis retire le logement de la liste", async () => {
    const cookie = await logIn();

    await request(server)
      .post("/api/bookings")
      .set("Cookie", cookie)
      .send(aBooking)
      .expect(200);

    const available = await request(server)
      .get("/api/accommodations?from=2024-06-01&to=2024-06-03&adults=2")
      .expect(200);
    expect(
      (available.body.data as { id: string }[]).some((a) => a.id === "accommodation-1")
    ).toBe(false);
  });

  it("répond 409 quand le logement vient d'être pris", async () => {
    const cookie = await logIn();
    await request(server)
      .post("/api/bookings")
      .set("Cookie", cookie)
      .send(aBooking)
      .expect(200);

    const conflict = await request(server)
      .post("/api/bookings")
      .set("Cookie", cookie)
      .send(aBooking)
      .expect(409);

    expect(conflict.body.error.code).toBe("ACCOMMODATION_NOT_AVAILABLE");
    expect(conflict.body.error.details.accommodationId).toBe("accommodation-1");
  });

  it("répond 422 sur une demande mal formée", async () => {
    const cookie = await logIn();
    const response = await request(server)
      .post("/api/bookings")
      .set("Cookie", cookie)
      .send({ ...aBooking, from: "hier" })
      .expect(422);

    expect(response.body.error.code).toBe("NOT_A_CALENDAR_DAY");
  });

  it("liste les réservations de l'utilisateur du cookie, et pas d'un autre", async () => {
    const cookie = await logIn();
    await request(server)
      .post("/api/bookings")
      .set("Cookie", cookie)
      .send(aBooking)
      .expect(200);

    const mine = await request(server)
      .get("/api/bookings")
      .set("Cookie", cookie)
      .expect(200);
    expect(mine.body.data).toHaveLength(1);
    expect(mine.body.data[0].name).toBe("Villa 6 pièces avec piscine");

    const other = await request(server)
      .post("/api/sessions")
      .send({ email: "otherguest@mail.com", password: "secret" });
    const theirs = await request(server)
      .get("/api/bookings")
      .set("Cookie", other.headers["set-cookie"] as unknown as string[])
      .expect(200);
    expect(theirs.body.data).toHaveLength(0);
  });

  it("annule une réservation par une ressource, pas par un DELETE", async () => {
    const cookie = await logIn();
    await request(server)
      .post("/api/bookings")
      .set("Cookie", cookie)
      .send(aBooking)
      .expect(200);

    await request(server)
      .post("/api/bookings/booking-1/cancellation")
      .set("Cookie", cookie)
      .expect(200);

    const mine = await request(server)
      .get("/api/bookings")
      .set("Cookie", cookie)
      .expect(200);
    // La trace demeure, avec son statut.
    expect(mine.body.data[0].status).toBe("cancelled");
  });

  it("dit au frontend qui il est, puisqu'il ne peut pas lire le cookie", async () => {
    const cookie = await logIn();
    const me = await request(server).get("/api/me").set("Cookie", cookie).expect(200);
    expect(me.body.data).toEqual({ id: "tenant-1", email: "faketenant@mail.com" });

    await request(server).get("/api/me").expect(401);
  });

  it("joint un identifiant de requête à chaque réponse", async () => {
    const response = await request(server).get("/health").expect(200);
    expect(response.headers["x-request-id"]).toBeDefined();
  });

  it("efface le cookie et invalide la session à la déconnexion", async () => {
    const cookie = await logIn();
    await request(server).delete("/api/sessions").set("Cookie", cookie).expect(204);

    const after = await request(server)
      .get("/api/bookings")
      .set("Cookie", cookie)
      .expect(401);
    expect(after.body.error.code).toBe("INVALID_SESSION");
  });
});
