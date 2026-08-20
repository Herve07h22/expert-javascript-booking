import type { Mailer } from "@booking/infra";

/**
 * L'adaptateur d'envoi. Remplacez le corps par nodemailer ou le SDK de votre
 * prestataire : c'est la seule ligne du projet qui doit changer.
 */
export function smtpMailer(config: { smtpUrl: string }): Mailer {
  return {
    async send({ from, to, subject }) {
      if (!config.smtpUrl || config.smtpUrl === "log://") {
        console.log(JSON.stringify({ mail: { from, to, subject } }));
        return;
      }
      throw new Error(
        "smtpMailer: branchez ici votre client SMTP (nodemailer, Resend, ...)"
      );
    },
  };
}
