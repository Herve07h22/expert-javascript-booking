/** Prévisible, donc testable : booking-1, booking-2, ... */
export const testIdProvider = () => {
  let counter = 0;
  return { newId: () => `booking-${++counter}` };
};
