import express from "express";
import cookieParser from "cookie-parser";
import { randomUUID } from "node:crypto";
import { routes } from "./routes.js";

/**
 * Express, Fastify ou le module http de Node : cela n'a aucune importance.
 * Ce qui compte est que le choix soit confiné dans ce répertoire.
 */
export function createServer(app, { logger, isProduction = false } = {}) {
  const server = express();

  // "ça n'a pas marché, il y avait le code a3f9c1" : cinq lignes qui changent
  // la vie du support.
  server.use((request, response, next) => {
    request.id = request.headers["x-request-id"] ?? randomUUID();
    response.setHeader("x-request-id", request.id);
    next();
  });

  // Une limite de taille n'est pas une règle métier : c'est une protection
  // de transport. Sans elle, un client envoie 500 Mo.
  server.use(express.json({ limit: "16kb" }));
  server.use(cookieParser());
  server.use(routes(app, { logger, isProduction }));

  server.get("/health", (request, response) => response.json({ ok: true }));

  // Sans ce filet, une exception non prévue laisse la requête pendante.
  // eslint-disable-next-line no-unused-vars
  server.use((error, request, response, next) => {
    logger.error({ error, requestId: request.id, url: request.url }, "unhandled");
    response.status(500).json({ error: { code: "INTERNAL_ERROR", requestId: request.id } });
  });

  return server;
}
