/**
 * Un seul fichier lit process.env.
 * Une variable manquante doit EMPÊCHER le serveur de démarrer, pas produire
 * un undefined qui se manifestera trois heures plus tard sur une route rare.
 */
export function readConfig(env) {
  const required = ["DATABASE_URL", "PUBLIC_URL", "SMTP_URL"];
  const missing = required.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing configuration: ${missing.join(", ")}`);
  }
  return {
    port: Number(env.PORT ?? 3000),
    databaseUrl: env.DATABASE_URL,
    baseUrl: env.PUBLIC_URL,
    smtpUrl: env.SMTP_URL,
    from: env.MAIL_FROM ?? "no-reply@booking.example",
    logLevel: env.LOG_LEVEL ?? "info",
    isProduction: env.NODE_ENV === "production",
  };
}
