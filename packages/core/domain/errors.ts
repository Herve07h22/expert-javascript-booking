/**
 * Une erreur métier est une DONNÉE, pas une phrase.
 *
 * Trois publics attendent trois choses :
 * - le code appelant veut savoir QUOI faire         -> `code`
 * - l'utilisateur veut une phrase dans sa langue    -> le client, via le code
 * - vous, à 3 h du matin, voulez le contexte        -> `details`
 */
export type Details = Record<string, unknown>;

export interface DomainErrorShape extends Error {
  name: "DomainError";
  code: string;
  details: Details;
}

export function DomainError(code: string, details: Details = {}): DomainErrorShape {
  const error = new Error(code) as DomainErrorShape;
  error.name = "DomainError";
  error.code = code;
  error.details = details;
  return error;
}

export function isDomainError(error: unknown): error is DomainErrorShape {
  return (error as DomainErrorShape | null)?.name === "DomainError";
}
