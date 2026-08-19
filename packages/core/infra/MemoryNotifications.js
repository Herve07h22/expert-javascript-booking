/**
 * La dépendance de test EST l'assertion.
 * Ce n'est pas un simulacre : c'est une implémentation, avec un comportement.
 */
export class MemoryNotifications {
  sent = [];

  async send(notification) {
    this.sent.push(notification);
  }
}
