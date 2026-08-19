import { isDomainError } from "@booking/core";

/**
 * 401 : je ne sais pas qui vous êtes.
 * 403 : je sais qui vous êtes, et vous n'avez pas le droit.
 * 404 : ça n'existe pas — ou ça ne vous concerne pas.
 * 409 : votre demande est bien formée, l'état du système s'y oppose.
 * 422 : votre demande est mal formée.
 *
 * Le repère : 422 dit "recommencez autrement", 409 dit "recommencez plus tard".
 */
const statusByCode = {
  SHOULD_BE_LOGGED: 401,
  INVALID_CREDENTIALS: 401,
  INVALID_SESSION: 401,
  UNKNOWN_BOOKING: 404,
  UNKNOWN_ACCOMMODATION: 404,
  ACCOMMODATION_NOT_AVAILABLE: 409,
  BOOKING_ALREADY_CANCELLED: 409,
  STAY_ALREADY_STARTED: 409,
};

export function respondWithError(response, error, logger) {
  const requestId = response.getHeader("x-request-id");

  if (!isDomainError(error)) {
    // Un bug, pas un cas métier : on journalise tout, on ne dit rien.
    // Une pile d'appels renvoyée au client est une carte de votre système.
    logger.error({ error, requestId }, "unexpected");
    return response
      .status(500)
      .json({ error: { code: "INTERNAL_ERROR", requestId } });
  }

  const status = statusByCode[error.code] ?? 422;
  return response.status(status).json({
    error: { code: error.code, details: error.details, requestId },
  });
}
