import type { Notification, Notifications } from "../domain/ports.js";

/**
 * La dépendance de test EST l'assertion.
 * Ce n'est pas un simulacre : c'est une implémentation, avec un comportement.
 */
export class MemoryNotifications implements Notifications {
  readonly sent: Notification[] = [];

  async send(notification: Notification): Promise<void> {
    this.sent.push(notification);
  }
}
