import express from "express";
import type { Express, NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { randomUUID } from "node:crypto";
import type { App, Dependencies, Logger } from "@booking/core";
import { routes } from "./routes.js";

/**
 * Express, Fastify ou le module http de Node : cela n'a aucune importance.
 * Ce qui compte est que le choix soit confiné dans ce répertoire.
 */
export function createServer(
  app: App,
  {
    logger,
    isProduction = false,
    dependencies,
  }: { logger: Logger; isProduction?: boolean; dependencies?: Dependencies }
): Express {
  const server = express();

  // "ça n'a pas marché, il y avait le code a3f9c1" : cinq lignes qui changent
  // la vie du support.
  server.use((request: Request, response: Response, next: NextFunction) => {
    const id = (request.headers["x-request-id"] as string) ?? randomUUID();
    (request as Request & { id: string }).id = id;
    response.setHeader("x-request-id", id);
    next();
  });

  // Une limite de taille n'est pas une règle métier : c'est une protection
  // de transport. Sans elle, un client envoie 500 Mo.
  server.use(express.json({ limit: "16kb" }));
  server.use(cookieParser());
  server.use(routes(app, { logger, isProduction }));

  /**
   * Deux sondes, pas une.
   *
   * /health (liveness) : ce processus est-il vivant ? S'il échoue, on
   * REDÉMARRE le conteneur. Ne vérifiez SURTOUT pas la base ici : un hoquet
   * de dix secondes redémarrerait toutes vos instances en même temps, et un
   * incident mineur deviendrait une panne totale.
   *
   * /ready (readiness) : peut-il servir du trafic ? S'il échoue, on cesse de
   * lui ENVOYER des requêtes, sans le tuer.
   */
  server.get("/health", (_request, response) => {
    response.json({ ok: true });
  });

  server.get("/ready", (_request, response) => {
    void (async () => {
      try {
        await app.dependencies.accommodations.all();
        response.json({ ok: true });
      } catch (error) {
        logger.error({ error }, "not ready");
        response.status(503).json({ ok: false });
      }
    })();
  });

  // Sans ce filet, une exception non prévue laisse la requête pendante.
  server.use(
    (
      error: unknown,
      request: Request,
      response: Response,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _next: NextFunction
    ) => {
      const id = (request as Request & { id?: string }).id;
      logger.error({ error, requestId: id, url: request.url }, "unhandled");
      response
        .status(500)
        .json({ error: { code: "INTERNAL_ERROR", requestId: id } });
    }
  );

  return server;
}
