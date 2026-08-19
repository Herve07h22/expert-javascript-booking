/**
 * Une erreur métier est une DONNÉE, pas une phrase.
 *
 * Trois publics attendent trois choses :
 * - le code appelant veut savoir QUOI faire         -> `code`
 * - l'utilisateur veut une phrase dans sa langue    -> le frontend, via le code
 * - vous, à 3 h du matin, voulez le contexte        -> `details`
 *
 * Le `code` est stable : on peut reformuler un message autant qu'on veut,
 * jamais le code. C'est un contrat, au même titre qu'une route d'API.
 */
export function DomainError(code, details = {}) {
  const error = new Error(code);
  error.name = "DomainError";
  error.code = code;
  error.details = details;
  return error;
}

export function isDomainError(error) {
  return error?.name === "DomainError";
}
