import pg from "pg";

/**
 * node-postgres convertit les colonnes `date` en objets Date JavaScript,
 * à minuit DANS LE FUSEAU DU SERVEUR. Un serveur en UTC+2 relit le 2 juin
 * comme le 1er juin 22h UTC, et un affichage distrait montre la veille.
 *
 * Nous demandons la chaîne, sans interprétation : c'est exactement ce que
 * CalendarDay.parse attend.
 *
 * Méfiez-vous des conversions automatiques aux frontières.
 */
const DATE_OID = 1082;

export function configurePgTypes() {
  pg.types.setTypeParser(DATE_OID, (value) => value);
}
