import { Stay } from "../values/Stay.js";
import { Occupancy } from "../values/Occupancy.js";
import { canHost } from "../rules/canHost.js";
import { Booking } from "../entities/Booking.js";
import { BookingConfirmed } from "../events.js";

export function book(payload) {
  const { accommodationId } = payload;
  return async function (dependencies, context) {
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
      id: dependencies.idProvider.newId("booking"),
      tenantId: user.id,
      accommodationId,
      guests: guests.value,
      stay: stay.value,
    });
    await dependencies.bookings.save(booking);

    // La commande dit ce qui s'est passé. Elle ne se soucie pas de qui écoute.
    return context.withEvent(
      BookingConfirmed(booking, dependencies.idProvider.newId("event"))
    );
  };
}

export function shouldBeLogged() {
  return new Error("User should be logged in");
}

export function StayMustStartInTheFuture(today) {
  return new Error(`A stay must start after ${today} (one day notice)`);
}

export function UnknownAccommodation(accommodationId) {
  return new Error(`Unknown accommodation ${accommodationId}`);
}

export function AccommodationTooSmall(accommodationId, capacity, guests) {
  return new Error(
    `Accommodation ${accommodationId} hosts ${capacity} guests, not ${guests}`
  );
}

export function AccommodationNotAvailable(accommodationId) {
  return new Error(`Accommodation ${accommodationId} is not available`);
}
