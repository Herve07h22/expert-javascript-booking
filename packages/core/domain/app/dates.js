export const toDate = (something) => new Date(something).valueOf();

export const sameDay = (date1, date2, timezone = "FR-fr") =>
  new Date(date1).toLocaleDate(timezone) ===
  new Date(date2).toLocaleDate(timezone);

export const isBeforeOrEqual = (date1, date2) => date1 <= date2;

export const isBefore = (date1, date2) => date1 < date2;

export function isOverlapped(interval1, interval2) {
  const distinct =
    isBefore(interval1.to, interval2.from) || // case [ interval1 ] ... [ interval2 ]
    isBefore(interval2.to, interval1.from); // case [ interval2 ] ... [ interval1 ]
  return !distinct;
}
