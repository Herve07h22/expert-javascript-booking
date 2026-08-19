/**
 * Prévisible, donc testable : booking-1, booking-2, event-1...
 * En production, `newId()` retourne un UUID et ignore le préfixe.
 */
export const testIdProvider = () => {
  const counters = new Map();
  return {
    newId: (prefix = "id") => {
      const next = (counters.get(prefix) ?? 0) + 1;
      counters.set(prefix, next);
      return `${prefix}-${next}`;
    },
  };
};
