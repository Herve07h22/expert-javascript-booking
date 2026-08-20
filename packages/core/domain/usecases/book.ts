import { Stay } from "../values/Stay.js";
import { Occupancy } from "../values/Occupancy.js";
import { canHost } from "../rules/canHost.js";
import { Booking } from "../entities/Booking.js";
import { BookingConfirmed } from "../events.js";
import {
  shouldBeLogged,
  StayMustStartInTheFuture,
  UnknownAccommodation,
  AccommodationTooSmall,
  AccommodationNotAvailable,
} from "../errorCodes.js";
import type { Command } from "../ports.js";
import { AccommodationId, BookingId, TenantId } from "../ids.js";

export interface BookPayload {
  accommodationId?: unknown;
  adults?: unknown;
  children?: unknown;
  from?: unknown;
  to?: unknown;
}

export const book: Command<BookPayload> =
  (payload) => async (dependencies, context) => {
    const user = context.loggedUser; // Peut-être null !
    if (!user) {
      return context.withError(shouldBeLogged());
    }

    // Les valeurs se construisent, ou refusent de se construire.
    const guests = Occupancy.of(payload);
    if (guests.isError()) {
      return context.withError(guests.error);
    }

    const stay = Stay.parse(payload);
    if (stay.isError()) {
      return context.withError(stay.error);
    }

    // Premier invariant qui a besoin du monde extérieur : la date du jour.
    const today = dependencies.dateProvider.today();
    if (!stay.value.startsAfter(today)) {
      return context.withError(StayMustStartInTheFuture(today));
    }

    const accommodationId = String(payload.accommodationId ?? "");

    // Le logement existe-t-il ?
    const accommodation = await dependencies.accommodations.findById(
      accommodationId
    );
    if (!accommodation) {
      return context.withError(UnknownAccommodation(accommodationId));
    }

    // Est-il assez grand ?
    if (!canHost(accommodation, guests.value)) {
      return context.withError(
        AccommodationTooSmall(
          accommodationId,
          accommodation.capacity,
          guests.value.total
        )
      );
    }

    // Est-il libre ? La requête filtre, la commande refuse.
    const conflicts = await dependencies.bookings.findOverlapping(
      accommodationId,
      stay.value
    );
    if (conflicts.length > 0) {
      return context.withError(AccommodationNotAvailable(accommodationId));
    }

    const booking = Booking.confirm({
      id: BookingId(dependencies.idProvider.newId("booking")),
      tenantId: TenantId(user.id),
      accommodationId: AccommodationId(accommodationId),
      guests: guests.value,
      stay: stay.value,
    });
    await dependencies.bookings.save(booking);

    // La commande dit ce qui s'est passé. Elle ignore qui écoute.
    return context.withEvent(
      BookingConfirmed(
        booking,
        dependencies.idProvider.newId("event")
      ) as never
    );
  };
