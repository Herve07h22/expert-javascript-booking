import { useState, useEffect, useCallback } from "react";
import { authenticate, listMyBookings } from "@booking/core";
import { app } from "../domain";

export function useMyBookings(session) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = session?.token;

  const load = useCallback(async () => {
    setLoading(true);
    const context = await app.run([authenticate(token), listMyBookings()]);
    setBookings(context.data ?? []);
    setError(context.error ? context.error.message : null);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    let obsolete = false;
    (async () => {
      setLoading(true);
      const context = await app.run([authenticate(token), listMyBookings()]);
      if (obsolete) return;
      setBookings(context.data ?? []);
      setError(context.error ? context.error.message : null);
      setLoading(false);
    })();
    return () => {
      obsolete = true;
    };
  }, [token]);

  return { bookings, loading, error, refresh: load };
}
