// La façade publique du domaine.
// Tout ce qui ne figure pas ici reste privé, et pourra être renommé sans prévenir.
export { App } from "./domain/app/App.js";
export { Context } from "./domain/app/Context.js";
export { Rollback } from "./domain/app/Rollback.js";

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

export { DomainError, isDomainError } from "./domain/errors.js";
export * from "./domain/errorCodes.js";
export { BookingConfirmed, BookingCancelled } from "./domain/events.js";

// Les implémentations en mémoire : elles n'ont aucune dépendance,
// elles font tourner les tests et permettent une démo sans base de données.
export { testDependencies } from "./infra/testDependencies.js";
export { subscribers } from "./infra/subscribers.js";
export { systemDateProvider } from "./infra/systemDateProvider.js";
export { MemoryUnitOfWork } from "./infra/MemoryUnitOfWork.js";
