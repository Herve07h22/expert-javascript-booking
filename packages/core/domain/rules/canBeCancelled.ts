import type { Booking } from "../entities/Booking.js";
import type { CalendarDay } from "../values/CalendarDay.js";

/** On n'annule que ce qui est actif et qui n'a pas encore commencé. */
export function canBeCancelled(booking: Booking, today: CalendarDay): boolean {
  return booking.isActive() && booking.stay.startsAfter(today);
}
