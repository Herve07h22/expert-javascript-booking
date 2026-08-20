import { shouldBeLogged } from "../errorCodes.js";
import type { UseCase } from "../ports.js";
import { TenantId } from "../ids.js";

/**
 * Une requête privée passe par le même péage que les commandes.
 * L'identifiant ne vient pas du paramètre : il vient du contexte,
 * c'est-à-dire du jeton, c'est-à-dire du serveur.
 */
export function listMyBookings(): UseCase {
  return async (dependencies, context) => {
    const user = context.loggedUser;
    if (!user) {
      return context.withError(shouldBeLogged());
    }
    const today = dependencies.dateProvider.today();
    const bookings = await dependencies.queries.bookingsOfTenant(
      TenantId(user.id),
      today
    );
    return context.withData(bookings);
  };
}
