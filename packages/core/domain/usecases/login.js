import { InvalidCredentials } from "../errorCodes.js";
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

