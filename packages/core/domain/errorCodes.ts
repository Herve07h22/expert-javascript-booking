import { DomainError } from "./errors.js";
import type { DomainErrorShape } from "./errors.js";

// Ne construisez jamais une erreur à la main : trente chapitres plus tard,
// on change leur nature en modifiant un seul fichier.

export const shouldBeLogged = (): DomainErrorShape =>
  DomainError("SHOULD_BE_LOGGED");

export const InvalidCredentials = (): DomainErrorShape =>
  DomainError("INVALID_CREDENTIALS");

export const InvalidSession = (): DomainErrorShape =>
  DomainError("INVALID_SESSION");

export const NotACalendarDay = (value: unknown): DomainErrorShape =>
  DomainError("NOT_A_CALENDAR_DAY", { value: String(value) });

export const StayMustLastAtLeastOneNight = (
  from: unknown,
  to: unknown
): DomainErrorShape =>
  DomainError("STAY_MUST_LAST_AT_LEAST_ONE_NIGHT", {
    from: String(from),
    to: String(to),
  });

export const StayMustStartInTheFuture = (today: unknown): DomainErrorShape =>
  DomainError("STAY_MUST_START_IN_THE_FUTURE", { today: String(today) });

export const NeedsAtLeastOneAdult = (adults: unknown): DomainErrorShape =>
  DomainError("NEEDS_AT_LEAST_ONE_ADULT", { adults });

export const InvalidChildrenCount = (children: unknown): DomainErrorShape =>
  DomainError("INVALID_CHILDREN_COUNT", { children });

export const UnknownAccommodation = (
  accommodationId: string
): DomainErrorShape =>
  DomainError("UNKNOWN_ACCOMMODATION", { accommodationId });

export const AccommodationTooSmall = (
  accommodationId: string,
  capacity: number,
  guests: number
): DomainErrorShape =>
  DomainError("ACCOMMODATION_TOO_SMALL", { accommodationId, capacity, guests });

export const AccommodationNotAvailable = (
  accommodationId: string
): DomainErrorShape =>
  DomainError("ACCOMMODATION_NOT_AVAILABLE", { accommodationId });

export const UnknownBooking = (bookingId: string): DomainErrorShape =>
  DomainError("UNKNOWN_BOOKING", { bookingId });

export const BookingAlreadyCancelled = (bookingId: string): DomainErrorShape =>
  DomainError("BOOKING_ALREADY_CANCELLED", { bookingId });

export const StayAlreadyStarted = (bookingId: string): DomainErrorShape =>
  DomainError("STAY_ALREADY_STARTED", { bookingId });
