export interface Config {
  port: number;
  databaseUrl: string;
  baseUrl: string;
  smtpUrl: string;
  from: string;
  logLevel: string;
  isProduction: boolean;
}

/**
 * Un seul fichier lit process.env.
 * Une variable manquante doit EMPÊCHER le serveur de démarrer, pas produire
 * un undefined qui se manifestera trois heures plus tard sur une route rare.
 *
 * Une application qui démarre à moitié configurée est plus dangereuse qu'une
 * application qui ne démarre pas.
 */
export function readConfig(env: NodeJS.ProcessEnv): Config {
  const required = ["DATABASE_URL", "PUBLIC_URL", "SMTP_URL"];
  const missing = required.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing configuration: ${missing.join(", ")}`);
  }
  return {
    port: Number(env.PORT ?? 3000),
    databaseUrl: env.DATABASE_URL as string,
    baseUrl: env.PUBLIC_URL as string,
    smtpUrl: env.SMTP_URL as string,
    from: env.MAIL_FROM ?? "no-reply@booking.example",
    logLevel: env.LOG_LEVEL ?? "info",
    isProduction: env.NODE_ENV === "production",
  };
}
