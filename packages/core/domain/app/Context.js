export class Context {
  withError(error) {
    this.error = error;
    return this;
  }
  withUser(user) {
    this.loggedUser = user;
    return this;
  }
  isOk() {
    return !this.error;
  }
}
