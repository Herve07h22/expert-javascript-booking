import type { Occupancy } from "../values/Occupancy.js";
import type { Accommodation } from "../ports.js";

/**
 * La commande s'en sert pour REFUSER, la requête pour FILTRER.
 * Une règle métier écrite à deux endroits est une règle corrigée à un seul.
 */
export function canHost(
  accommodation: Pick<Accommodation, "capacity">,
  occupancy: Occupancy
): boolean {
  return occupancy.total <= accommodation.capacity;
}
