import { templates } from "./templates.js";
import type { Notification, Notifications } from "@booking/core";

export interface Mailer {
  send(mail: {
    from: string;
    to: string;
    subject: string;
    html: string;
  }): Promise<void>;
}

export interface MailConfig {
  baseUrl: string;
  from: string;
}

/**
 * Tout ce que nous avons refusé de laisser entrer dans le domaine se retrouve
 * ici, et s'y trouve bien : l'adresse d'expédition, les gabarits, l'URL.
 *
 * Un adaptateur a le droit d'avoir lui-même des dépendances injectées.
 */
export class EmailNotifications implements Notifications {
  constructor(
    private readonly mailer: Mailer,
    private readonly config: MailConfig
  ) {}

  async send({ type, to, payload }: Notification): Promise<void> {
    const template = templates[type];
    if (!template) {
      // Pas un cas métier : un bug de déploiement. Il doit faire du bruit.
      // Le Result sert aux erreurs que l'APPELANT doit traiter.
      throw new Error(`No email template for notification ${type}`);
    }
    const { subject, html } = template(payload, this.config.baseUrl);
    await this.mailer.send({ from: this.config.from, to, subject, html });
  }
}
