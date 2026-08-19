/**
 * Une ligne de JSON, avec des champs : on peut alors DEMANDER
 * "les requêtes de plus d'une seconde", ou "cet identifiant précis".
 * Jamais de secret ici : les logs sont copiés, agrégés, conservés des mois.
 */
const levels = { debug: 10, info: 20, warn: 30, error: 40 };

export function createLogger(level = "info") {
  const threshold = levels[level] ?? levels.info;
  const write = (name) => (fields, message) => {
    if (levels[name] < threshold) return;
    const line = typeof fields === "string" ? { message: fields } : { ...fields, message };
    // eslint-disable-next-line no-console
    console[name === "error" ? "error" : "log"](
      JSON.stringify({ level: name, ...line })
    );
  };
  return {
    debug: write("debug"),
    info: write("info"),
    warn: write("warn"),
    error: write("error"),
  };
}
