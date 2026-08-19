import { templates } from "./templates.js";

/**
 * Tout ce que nous avons refusé de laisser entrer dans le domaine se retrouve
 * ici, et s'y trouve bien : l'adresse d'expédition, les gabarits, l'URL publique.
 */
export class EmailNotifications {
  constructor(mailer, config) {
    this._mailer = mailer;
    this._config = config;
  }

  async send({ type, to, payload }) {
    const template = templates[type];
    if (!template) {
      // Pas un cas métier : un bug de déploiement. Il doit faire du bruit.
      throw new Error(`No email template for notification ${type}`);
    }
    const { subject, html } = template(payload, this._config.baseUrl);
    await this._mailer.send({
      from: this._config.from,
      to,
      subject,
      html,
    });
  }
}
