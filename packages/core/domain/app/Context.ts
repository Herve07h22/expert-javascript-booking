import type { DomainErrorShape } from "../errors.js";
import type { DomainEvent } from "../events.js";
import type { User } from "../ports.js";
import type { SessionToken } from "../ids.js";

export interface SessionView {
  token: SessionToken | null;
  error: { code: string; details: Record<string, unknown> } | null;
  currentUser: { id: string; email: string } | null;
}

export class Context {
  error?: DomainErrorShape | Error;
  loggedUser?: User;
  token?: SessionToken;
  data?: unknown;
  readonly events: DomainEvent<never>[] = [];

  withError(error: DomainErrorShape | Error): this {
    this.error = error;
    return this;
  }

  withUser(user: User): this {
    this.loggedUser = user;
    return this;
  }

  withToken(token: SessionToken): this {
    this.token = token;
    return this;
  }

  withData(data: unknown): this {
    this.data = data;
    return this;
  }

  /** Le contexte accumulait l'utilisateur et l'erreur ; il accumule les faits. */
  withEvent(event: DomainEvent<never>): this {
    this.events.push(event);
    return this;
  }

  isOk(): boolean {
    return !this.error;
  }

  /**
   * Ce qui SORT du domaine n'est pas ce qui y vit.
   * Une liste blanche, jamais une liste noire : `delete user.hashedPassword`
   * marche jusqu'au jour où quelqu'un ajoute une colonne.
   */
  session(): SessionView {
    const error = this.error as DomainErrorShape | undefined;
    return {
      token: this.token ?? null,
      error: error
        ? { code: error.code ?? "INTERNAL_ERROR", details: error.details ?? {} }
        : null,
      currentUser: this.loggedUser
        ? { id: this.loggedUser.id, email: this.loggedUser.email }
        : null,
    };
  }
}
