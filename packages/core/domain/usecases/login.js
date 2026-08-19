export function login(payload) {
  const { email, password } = payload;
  return async function (dependencies, context) {
    const user = await dependencies.users.findByEmail(email);
    if (!user) {
      return context.withError(InvalidCredentials());
    }

    const matches = await dependencies.passwords.verify(
      password,
      user.hashedPassword
    );
    if (!matches) {
      return context.withError(InvalidCredentials());
    }

    const token = await dependencies.sessions.create(user);
    return context.withUser(user).withToken(token);
  };
}

/**
 * Un seul message pour les deux cas.
 * Deux messages distincts permettent de tester si une adresse est inscrite
 * sur la plateforme : c'est déjà une information qui ne vous appartient pas.
 */
export function InvalidCredentials() {
  return new Error("Invalid email or password");
}
