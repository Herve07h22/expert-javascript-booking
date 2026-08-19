export class Context {
  events = [];

  withError(error) {
    this.error = error;
    return this;
  }

  withUser(user) {
    this.loggedUser = user;
    return this;
  }

  withToken(token) {
    this.token = token;
    return this;
  }

  withData(data) {
    this.data = data;
    return this;
  }

  /** Le contexte accumulait l'utilisateur et l'erreur ; il accumule les faits. */
  withEvent(event) {
    this.events.push(event);
    return this;
  }

  isOk() {
    return !this.error;
  }

  /**
   * Ce qui SORT du domaine n'est pas ce qui y vit.
   * Une liste blanche, jamais une liste noire.
   */
  session() {
    return {
      token: this.token ?? null,
      error: this.error ? this.error.message : null,
      currentUser: this.loggedUser
        ? { id: this.loggedUser.id, email: this.loggedUser.email }
        : null,
    };
  }
}
