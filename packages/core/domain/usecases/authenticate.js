import { InvalidSession } from "../errorCodes.js";
/** La symétrique de login : elle remplit le contexte à partir d'un jeton. */
export function authenticate(token) {
  return async function (dependencies, context) {
    if (!token) {
      return context.withError(InvalidSession());
    }
    const userId = await dependencies.sessions.findUserId(token);
    if (!userId) {
      return context.withError(InvalidSession());
    }
    const user = await dependencies.users.findById(userId);
    if (!user) {
      // La session survit à l'utilisateur : compte supprimé, base restaurée.
      return context.withError(InvalidSession());
    }
    return context.withUser(user).withToken(token);
  };
}

