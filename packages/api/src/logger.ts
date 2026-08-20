import type { Logger } from "@booking/core";

/**
 * Une ligne de JSON, avec des champs : on peut alors DEMANDER "les requêtes
 * de plus d'une seconde", ou "cet identifiant précis".
 *
 * Jamais de secret ici : les logs sont copiés, agrégés, conservés des mois,
 * et lus par plus de gens que la base de données.
 *
 * Et `error` est réservé à ce qui exige une intervention humaine : si tout
 * est `error`, plus personne ne lit les `error`.
 */
const levels: Record<string, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export function createLogger(level = "info"): Logger {
  const threshold = levels[level] ?? levels.info!;

  const write =
    (name: keyof typeof levels) => (fields: unknown, message?: string) => {
      if (levels[name]! < threshold) return;
      const line =
        typeof fields === "string"
          ? { message: fields }
          : { ...(fields as object), message };
      const out = name === "error" ? console.error : console.log;
      out(JSON.stringify({ level: name, ...line }));
    };

  return {
    debug: write("debug"),
    info: write("info"),
    warn: write("warn"),
    error: write("error"),
  };
}
