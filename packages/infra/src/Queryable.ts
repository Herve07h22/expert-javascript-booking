/**
 * Le minimum que l'infrastructure demande à une connexion : savoir requêter.
 * Le pool et un client en transaction satisfont tous les deux cette forme —
 * c'est le typage structurel du chapitre 45.
 */
export type Row = Record<string, unknown>;

export interface Queryable {
  query(text: string, values?: unknown[]): Promise<{ rows: Row[] }>;
}
