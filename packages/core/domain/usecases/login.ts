import { InvalidCredentials } from "../errorCodes.js";
import type { Command } from "../ports.js";

export interface LoginPayload {
  email?: unknown;
  password?: unknown;
}

export const login: Command<LoginPayload> =
  (payload) => async (dependencies, context) => {
    const user = await dependencies.users.findByEmail(payload.email);
    if (!user) {
      return context.withError(InvalidCredentials());
    }

    const matches = await dependencies.passwords.verify(
      payload.password,
      user.hashedPassword
    );
    if (!matches) {
      return context.withError(InvalidCredentials());
    }

    const token = await dependencies.sessions.create(user);
    return context.withUser(user).withToken(token);
  };
