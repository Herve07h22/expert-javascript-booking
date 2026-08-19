/**
 * Se déconnecter, ce n'est pas oublier le ticket : c'est le faire annuler
 * au vestiaire. Et une déconnexion réussit toujours.
 */
export function logout(token) {
  return async function (dependencies, context) {
    await dependencies.sessions.destroy(token);
    return context;
  };
}
