import type { Criteria } from "./types.js";

// Un état qui décrit CE QUE L'UTILISATEUR REGARDE va dans l'URL.
// Un état qui décrit COMMENT L'ÉCRAN S'ANIME (un spinner) reste dans le composant.
const DEFAULTS: Criteria = {
  from: "2024-06-02",
  to: "2024-06-04",
  adults: 2,
  children: 0,
};

export function readCriteria(): Criteria {
  const params = new URLSearchParams(window.location.search);
  return {
    from: params.get("from") ?? DEFAULTS.from,
    to: params.get("to") ?? DEFAULTS.to,
    adults: Number(params.get("adults") ?? DEFAULTS.adults),
    children: Number(params.get("children") ?? DEFAULTS.children),
  };
}

export function writeCriteria(criteria: Criteria): void {
  const params = new URLSearchParams(
    Object.entries(criteria).map(([key, value]) => [key, String(value)])
  );
  // replaceState, et non pushState : chaque frappe dans un champ de date
  // créerait sinon une entrée d'historique, et le bouton retour serait inutilisable.
  window.history.replaceState(null, "", `?${params.toString()}`);
}
