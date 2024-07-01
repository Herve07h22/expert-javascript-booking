import { toDate, isBeforeOrEqual } from "../app/dates";

export function book(payload) {
  const { accomodationId, adults, children, from, to } = payload;
  return async function (dependencies, context) {
    const user = context.loggedUser; // Peut-être null !
    if (!user) {
      return context.withError(shouldBeLogged());
    }
    const { now } = dependencies.dateProvider;
    if (isBeforeOrEqual(toDate(from), now())) {
      return context.withError(InvalidInterval());
    }
    if (isBeforeOrEqual(toDate(to), toDate(from))) {
      return context.withError(InvalidInterval());
    }

    const booking = {
      tenantId: user.id,
      accomodationId,
      hosts: { adults, children },
      interval: { from: toDate(from), to: toDate(to) },
    };
    await dependencies.bookings.save(booking);
    return context;
  };
}

function shouldBeLogged() {
  return new Error("User should be logged in");
}

export function InvalidInterval() {
  return new Error("This date interval is not correct");
}
