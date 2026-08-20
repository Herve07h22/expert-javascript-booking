import type { UseCase } from "../ports.js";

/**
 * Se déconnecter, ce n'est pas oublier le ticket : c'est le faire annuler
 * au vestiaire. Et une déconnexion réussit toujours.
 */
export function logout(token: unknown): UseCase {
  return async (dependencies, context) => {
    await dependencies.sessions.destroy(token);
    return context;
  };
}
