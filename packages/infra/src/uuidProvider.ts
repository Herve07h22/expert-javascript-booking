import { randomUUID } from "node:crypto";
import type { IdProvider } from "@booking/core";

/**
 * En production, le préfixe n'a plus d'intérêt : l'identifiant est opaque.
 *
 * Pour une clé primaire, un UUID v7 ou un ULID vaut mieux qu'un v4 : ils
 * commencent par un horodatage, donc l'index ne se fragmente pas.
 */
export const uuidProvider: IdProvider = {
  newId: () => randomUUID(),
};
