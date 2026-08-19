/**
 * L'adaptateur d'envoi. Remplacez le corps par nodemailer ou le SDK de votre
 * prestataire : c'est la seule ligne du projet qui doit changer.
 */
export function smtpMailer(config) {
  return {
    async send({ from, to, subject, html }) {
      if (!config.smtpUrl || config.smtpUrl === "log://") {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify({ mail: { from, to, subject } }));
        return;
      }
      throw new Error(
        "smtpMailer: branchez ici votre client SMTP (nodemailer, Resend, ...)"
      );
    },
  };
}
