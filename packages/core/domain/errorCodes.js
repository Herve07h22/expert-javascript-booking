import { DomainError } from "./errors.js";

// Les fabriques d'erreurs, rassemblées. Ne construisez jamais une erreur
// à la main : trente chapitres plus tard, on change leur nature en modifiant
// un seul fichier.

export const shouldBeLogged = () => DomainError("SHOULD_BE_LOGGED");

export const InvalidCredentials = () => DomainError("INVALID_CREDENTIALS");

export const InvalidSession = () => DomainError("INVALID_SESSION");

export const NotACalendarDay = (value) =>
  DomainError("NOT_A_CALENDAR_DAY", { value: String(value) });

export const StayMustLastAtLeastOneNight = (from, to) =>
  DomainError("STAY_MUST_LAST_AT_LEAST_ONE_NIGHT", {
    from: String(from),
    to: String(to),
  });

export const StayMustStartInTheFuture = (today) =>
  DomainError("STAY_MUST_START_IN_THE_FUTURE", { today: String(today) });

export const NeedsAtLeastOneAdult = (adults) =>
  DomainError("NEEDS_AT_LEAST_ONE_ADULT", { adults });

export const InvalidChildrenCount = (children) =>
  DomainError("INVALID_CHILDREN_COUNT", { children });

export const UnknownAccommodation = (accommodationId) =>
  DomainError("UNKNOWN_ACCOMMODATION", { accommodationId });

export const AccommodationTooSmall = (accommodationId, capacity, guests) =>
  DomainError("ACCOMMODATION_TOO_SMALL", { accommodationId, capacity, guests });

export const AccommodationNotAvailable = (accommodationId) =>
  DomainError("ACCOMMODATION_NOT_AVAILABLE", { accommodationId });

export const UnknownBooking = (bookingId) =>
  DomainError("UNKNOWN_BOOKING", { bookingId });

export const BookingAlreadyCancelled = (bookingId) =>
  DomainError("BOOKING_ALREADY_CANCELLED", { bookingId });

export const StayAlreadyStarted = (bookingId) =>
  DomainError("STAY_ALREADY_STARTED", { bookingId });
