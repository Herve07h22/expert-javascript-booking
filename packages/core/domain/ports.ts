import type { Booking } from "./entities/Booking.js";
import type { CalendarDay } from "./values/CalendarDay.js";
import type { Occupancy } from "./values/Occupancy.js";
import type { Stay } from "./values/Stay.js";
import type { DomainEvent } from "./events.js";
import type { Context } from "./app/Context.js";
import type {
  AccommodationId,
  BookingId,
  SessionToken,
  TenantId,
  UserId,
} from "./ids.js";

/**
 * La dette du chapitre 12, remboursée : « on utilisera TypeScript pour
 * décrire une interface ».
 *
 * ATTENTION au contresens : ces interfaces ne remplacent pas les tests de
 * contrat. Un type garantit qu'une méthode existe et prend un Stay. Il ne dit
 * rien de ce qu'elle répond quand les bornes se touchent.
 * Les types vérifient les FORMES, les tests vérifient les COMPORTEMENTS.
 */

export interface User {
  id: UserId;
  email: string;
  hashedPassword: string;
}

export interface Accommodation {
  id: AccommodationId;
  hostId: UserId;
  name: string;
  location: string;
  host?: string;
  capacity: number;
  price: number;
  imageUrl?: string;
}

/** La vue de la page "mes réservations" : des chaînes et des nombres. */
export interface BookingView {
  id: string;
  status: string;
  cancellable: boolean;
  accommodationId: string;
  name: string;
  location: string;
  imageUrl?: string;
  from: string;
  to: string;
  nights: number;
  guests: number;
  price: number;
}

export interface UserRepository {
  findByEmail(email: unknown): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}

export interface AccommodationRepository {
  findById(id: string): Promise<Accommodation | null>;
  all(): Promise<Accommodation[]>;
}

export interface BookingRepository {
  save(booking: Booking): Promise<void>;
  findById(id: string): Promise<Booking | null>;
  findOverlapping(accommodationId: string, stay: Stay): Promise<Booking[]>;
  listBookingsForAccommodationId(accommodationId: string): Promise<Booking[]>;
  listBookingsForTenantId(tenantId: string): Promise<Booking[]>;
  getAvailableAccommodations(
    stay: Stay,
    occupancy?: Occupancy
  ): Promise<Accommodation[]>;
}

export interface SessionRepository {
  create(user: User): Promise<SessionToken>;
  findUserId(token: unknown): Promise<UserId | null>;
  destroy(token: unknown): Promise<void>;
}

export interface Queries {
  bookingsOfTenant(
    tenantId: TenantId,
    today: CalendarDay
  ): Promise<BookingView[]>;
}

export interface Notification {
  type: string;
  to: string;
  payload: Record<string, unknown>;
}

export interface Notifications {
  send(notification: Notification): Promise<void>;
}

/** L'horloge est une dépendance : elle change à chaque appel. */
export interface DateProvider {
  today(timeZone?: string): CalendarDay;
}

/** L'aléa aussi. */
export interface IdProvider {
  newId(prefix?: string): string;
}

export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(plain: unknown, hashed: string): Promise<boolean>;
}

export interface Logger {
  debug(fields: unknown, message?: string): void;
  info(fields: unknown, message?: string): void;
  warn(fields: unknown, message?: string): void;
  error(fields: unknown, message?: string): void;
}

export interface UnitOfWork {
  run(work: (dependencies: Dependencies) => Promise<Context>): Promise<Context>;
}

export interface Dependencies {
  users: UserRepository;
  accommodations: AccommodationRepository;
  bookings: BookingRepository;
  sessions: SessionRepository;
  queries: Queries;
  notifications: Notifications;
  dateProvider: DateProvider;
  idProvider: IdProvider;
  passwords: PasswordHasher;
  logger: Logger;
  unitOfWork: UnitOfWork;
  close?: () => Promise<void>;
}

/** Le currying du chapitre 10, en une ligne de type. */
export type UseCase = (
  dependencies: Dependencies,
  context: Context
) => Promise<Context>;

export type Command<P> = (payload: P) => UseCase;

export type Subscriber = (
  event: DomainEvent<never>,
  dependencies: Dependencies
) => Promise<void>;

export type Subscribers = Record<string, Subscriber[]>;

export type { BookingId, AccommodationId, TenantId, UserId, SessionToken };
