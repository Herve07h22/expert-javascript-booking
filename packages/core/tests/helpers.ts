import type { Context } from "../domain/app/Context.js";
import type { DomainErrorShape } from "../domain/errors.js";
import type { Dependencies, Notification } from "../domain/ports.js";
import { CalendarDay } from "../domain/values/CalendarDay.js";
import { Stay } from "../domain/values/Stay.js";
import { Occupancy } from "../domain/values/Occupancy.js";

/**
 * De quoi écrire des assertions lisibles sans disséminer des `as` dans les
 * tests. Un helper de test typé une fois vaut mieux que trente casts.
 */
export const errorCode = (context: Context): string | undefined =>
  (context.error as DomainErrorShape | undefined)?.code;

export const dataOf = <T>(context: Context): T => context.data as T;

export const day = (iso: string): CalendarDay => CalendarDay.parse(iso).value;

export const stay = (from: string, to: string): Stay =>
  Stay.parse({ from, to }).value;

export const occupancy = (adults: number, children = 0): Occupancy =>
  Occupancy.of({ adults, children }).value;

export const sentNotifications = (dependencies: Dependencies): Notification[] =>
  (dependencies.notifications as unknown as { sent: Notification[] }).sent;
