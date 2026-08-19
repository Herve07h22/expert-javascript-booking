/** On n'annule que ce qui est actif et qui n'a pas encore commencé. */
export function canBeCancelled(booking, today) {
  return booking.isActive() && booking.stay.startsAfter(today);
}
