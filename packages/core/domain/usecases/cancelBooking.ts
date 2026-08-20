import { canBeCancelled } from "../rules/canBeCancelled.js";
import { BookingCancelled } from "../events.js";
import {
  shouldBeLogged,
  UnknownBooking,
  BookingAlreadyCancelled,
  StayAlreadyStarted,
} from "../errorCodes.js";
import type { Command } from "../ports.js";

export interface CancelBookingPayload {
  bookingId: string;
}

export const cancelBooking: Command<CancelBookingPayload> =
  ({ bookingId }) =>
  async (dependencies, context) => {
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

    const cancelled = booking.cancel();
    await dependencies.bookings.save(cancelled);
    return context.withEvent(
      BookingCancelled(
        cancelled,
        dependencies.idProvider.newId("event")
      ) as never
    );
  };
