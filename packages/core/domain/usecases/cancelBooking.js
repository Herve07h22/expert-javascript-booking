import { canBeCancelled } from "../rules/canBeCancelled.js";
import { shouldBeLogged } from "./book.js";

export function cancelBooking(payload) {
  const { bookingId } = payload;
  return async function (dependencies, context) {
    const user = context.loggedUser;
    if (!user) {
      return context.withError(shouldBeLogged());
    }

    const booking = await dependencies.bookings.findById(bookingId);
    if (!booking) {
      return context.withError(UnknownBooking(bookingId));
    }

    // Pour un appelant qui n'y a pas droit, une ressource n'existe pas.
    if (!booking.belongsTo(user)) {
      return context.withError(UnknownBooking(bookingId));
    }

    if (!booking.isActive()) {
      return context.withError(BookingAlreadyCancelled(bookingId));
    }

    const today = dependencies.dateProvider.today();
    if (!canBeCancelled(booking, today)) {
      return context.withError(StayAlreadyStarted(bookingId));
    }

    await dependencies.bookings.save(booking.cancel());
    return context;
  };
}

export function UnknownBooking(bookingId) {
  return new Error(`Unknown booking ${bookingId}`);
}

export function BookingAlreadyCancelled(bookingId) {
  return new Error(`Booking ${bookingId} is already cancelled`);
}

export function StayAlreadyStarted(bookingId) {
  return new Error(`Booking ${bookingId} has already started`);
}
