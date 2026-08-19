/**
 * Le logement peut-il accueillir ce nombre d'occupants ?
 *
 * La commande s'en sert pour REFUSER, la requête pour FILTRER.
 * Une règle métier écrite à deux endroits est une règle corrigée à un seul.
 */
export function canHost(accommodation, occupancy) {
  return occupancy.total <= accommodation.capacity;
}
