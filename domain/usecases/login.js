export function login(payload) {
  const { email, password } = payload;
  return async function (dependencies, context) {
    const user = await dependencies.users.findByEmail(email);
    if (!user) {
      // Utilisateur inconnu
      return context.withError(UnknownUserEmail(email));
    }

    if (user.encryptedPassword !== encrypt(password)) {
      // Erreur de mot de passe
      return context.withError(WrongPassword(user));
    }

    // Tout est OK, ajoutons l'utilisateur au contexte
    // pour les commandes suivantes qui en auront besoin
    return context.withUser(user);
  };
}

function UnknownUserEmail(email) {
  return new Error(`Unknown user ${email}`);
}

function WrongPassword(user) {
  return new Error(`Wrong password ${user.email}`);
}

export function encrypt(text) {
  return text;
}
