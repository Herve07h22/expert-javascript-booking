// La façade publique du domaine.
// Tout ce qui ne figure pas ici reste privé, et pourra être renommé sans prévenir.
export { App } from "./domain/app/App.js";

export { book } from "./domain/usecases/book.js";
export { login } from "./domain/usecases/login.js";
export { authenticate } from "./domain/usecases/authenticate.js";
export { logout } from "./domain/usecases/logout.js";
export { cancelBooking } from "./domain/usecases/cancelBooking.js";
export { listMyBookings } from "./domain/usecases/listMyBookings.js";

export { Stay } from "./domain/values/Stay.js";
export { CalendarDay } from "./domain/values/CalendarDay.js";
export { Occupancy } from "./domain/values/Occupancy.js";
export { Booking, bookingStatus } from "./domain/entities/Booking.js";
export { canHost } from "./domain/rules/canHost.js";
export { canBeCancelled } from "./domain/rules/canBeCancelled.js";

export { testDependencies } from "./infra/testDependencies.js";
