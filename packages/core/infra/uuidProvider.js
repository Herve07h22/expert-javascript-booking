import { randomUUID } from "node:crypto";

/** En production, le préfixe n'a plus d'intérêt : l'identifiant est opaque. */
export const uuidProvider = {
  newId: () => randomUUID(),
};
