/**
 * Un identifiant n'est pas une chaîne.
 *
 * Cinq lignes, et `book({ accommodationId: user.id })` ne compile plus.
 * Une inversion d'identifiants est le bug le plus bête qui soit : le code
 * s'exécute, la requête s'exécute, et les données sont fausses.
 *
 * La marque n'existe QU'À LA COMPILATION : à l'exécution, c'est une chaîne.
 */
declare const brand: unique symbol;
type Brand<T, B> = T & { readonly [brand]: B };

export type TenantId = Brand<string, "TenantId">;
export type AccommodationId = Brand<string, "AccommodationId">;
export type BookingId = Brand<string, "BookingId">;
export type UserId = Brand<string, "UserId">;
export type SessionToken = Brand<string, "SessionToken">;

export const TenantId = (value: string): TenantId => value as TenantId;
export const AccommodationId = (value: string): AccommodationId =>
  value as AccommodationId;
export const BookingId = (value: string): BookingId => value as BookingId;
export const UserId = (value: string): UserId => value as UserId;
export const SessionToken = (value: string): SessionToken =>
  value as SessionToken;
