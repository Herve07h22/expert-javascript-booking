import { Stay } from "../values/Stay.js";
import { Occupancy } from "../values/Occupancy.js";

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

    // Seul invariant qui a besoin du monde extérieur : la date du jour.
    const today = dependencies.dateProvider.today();
    if (!stay.value.startsAfter(today)) {
      return context.withError(StayMustStartInTheFuture(today));
    }

    await dependencies.bookings.save({
      tenantId: user.id,
      accommodationId,
      guests: guests.value,
      stay: stay.value,
    });
    return context;
  };
}

export function shouldBeLogged() {
  return new Error("User should be logged in");
}

export function StayMustStartInTheFuture(today) {
  return new Error(`A stay must start after ${today} (one day notice)`);
}
