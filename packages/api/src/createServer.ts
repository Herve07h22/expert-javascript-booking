import express from "express";
import type { Express, NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { randomUUID } from "node:crypto";
import type { App, Logger } from "@booking/core";
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
  }: { logger: Logger; isProduction?: boolean }
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

  server.get("/health", (_request, response) => {
    response.json({ ok: true });
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
