import { Router } from "express";
import type { Request, Response } from "express";
import {
  authenticate,
  book,
  cancelBooking,
  listMyBookings,
  login,
  logout,
  Stay,
  Occupancy,
} from "@booking/core";
import type { App, Logger, UseCase } from "@booking/core";
import { respondWithError } from "./respondWithError.js";

const SEVEN_DAYS = 7 * 24 * 3600 * 1000;

interface Options {
  logger: Logger;
  isProduction: boolean;
}

/**
 * Un contrôleur ne fait que quatre choses : traduire une requête HTTP en
 * scénario, l'exécuter, traduire le contexte en réponse, et RIEN D'AUTRE.
 *
 * Un `if` sur une date ici serait du code volé au domaine.
 */
export function routes(app: App, { logger, isProduction }: Options): Router {
  const router = Router();

  const handle =
    (scenario: (request: Request) => UseCase[]) =>
    async (request: Request, response: Response) => {
      try {
        const context = await app.run(scenario(request));
        if (context.error) {
          return respondWithError(response, context.error, logger);
        }
        response.status(200).json({
          data: context.data ?? context.session().currentUser ?? null,
        });
      } catch (error) {
        respondWithError(response, error, logger);
      }
    };

  // --- Sessions -------------------------------------------------------------

  router.post("/api/sessions", async (request, response) => {
    const context = await app.run([login(request.body ?? {})]);
    if (context.error) {
      return respondWithError(response, context.error, logger);
    }
    // Le frontend ne voit plus jamais le jeton : le navigateur le joint seul.
    response.cookie("session", context.token as string, {
      httpOnly: true, // invisible pour le JavaScript de la page
      secure: isProduction, // sur http, un cookie Secure ne partirait pas
      sameSite: "lax", // coupe l'essentiel des attaques CSRF
      maxAge: SEVEN_DAYS,
      path: "/",
    });
    response.status(200).json({ data: context.session().currentUser });
  });

  router.delete("/api/sessions", async (request, response) => {
    await app.run([logout(request.cookies?.session)]);
    response.clearCookie("session", { path: "/" });
    response.status(204).end();
  });

  // Le cookie est HttpOnly : le frontend ne peut pas le lire. Il demande donc
  // au serveur qui il est, au démarrage.
  router.get(
    "/api/me",
    handle((request) => [authenticate(request.cookies?.session)])
  );

  // --- Requêtes -------------------------------------------------------------

  // Publique : une donnée publique n'a pas besoin de savoir qui la demande.
  router.get("/api/accommodations", async (request, response) => {
    const { from, to, adults, children } = request.query;

    const stay = Stay.parse({ from, to });
    if (stay.isError()) {
      return respondWithError(response, stay.error, logger);
    }
    const guests = Occupancy.of({
      adults: Number(adults ?? 1),
      children: Number(children ?? 0),
    });
    if (guests.isError()) {
      return respondWithError(response, guests.error, logger);
    }

    const accommodations =
      await app.dependencies.bookings.getAvailableAccommodations(
        stay.value,
        guests.value
      );
    response.status(200).json({ data: accommodations });
  });

  // Privée : authenticate en tête de liste, comme un péage.
  router.get(
    "/api/bookings",
    handle((request) => [
      authenticate(request.cookies?.session),
      listMyBookings(),
    ])
  );

  // --- Commandes ------------------------------------------------------------

  router.post(
    "/api/bookings",
    handle((request) => [
      authenticate(request.cookies?.session),
      // Le corps est passé tel quel : les Value Objects SONT les validateurs.
      // Le domaine valide le SENS, le contrôleur protège la RESSOURCE.
      book(request.body ?? {}),
    ])
  );

  // Nous ne supprimons rien : la réservation reste, avec un statut.
  // Quand une action métier n'est pas un CRUD, ne la déguisez pas en CRUD.
  router.post(
    "/api/bookings/:id/cancellation",
    handle((request) => [
      authenticate(request.cookies?.session),
      cancelBooking({ bookingId: String(request.params.id) }),
    ])
  );

  return router;
}
