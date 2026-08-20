export interface Config {
  port: number;
  databaseUrl: string;
  baseUrl: string;
  smtpUrl: string;
  from: string;
  logLevel: string;
  isProduction: boolean;
  /** Démo et tests de bout en bout : le domaine tourne sans base de données. */
  useMemory: boolean;
}

/**
 * Un seul fichier lit process.env.
 *
 * Une variable manquante doit EMPÊCHER le serveur de démarrer, pas produire
 * un undefined qui se manifestera trois heures plus tard sur une route peu
 * fréquentée. Une application qui démarre à moitié configurée est plus
 * dangereuse qu'une application qui ne démarre pas.
 */
export function readConfig(env: NodeJS.ProcessEnv): Config {
  const useMemory = env.USE_MEMORY === "1";

  const required = useMemory ? [] : ["DATABASE_URL", "PUBLIC_URL", "SMTP_URL"];
  const missing = required.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing configuration: ${missing.join(", ")}`);
  }

  return {
    port: Number(env.PORT ?? 3000),
    databaseUrl: env.DATABASE_URL ?? "",
    baseUrl: env.PUBLIC_URL ?? "http://localhost:5173",
    smtpUrl: env.SMTP_URL ?? "log://",
    from: env.MAIL_FROM ?? "no-reply@booking.example",
    logLevel: env.LOG_LEVEL ?? "info",
    isProduction: env.NODE_ENV === "production",
    useMemory,
  };
}
