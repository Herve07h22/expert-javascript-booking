import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { toMessage } from "../errorMessages";

export function useMyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (signal) => {
    setLoading(true);
    try {
      const { data } = await api.myBookings(signal);
      setBookings(data);
      setError(null);
    } catch (apiError) {
      if (apiError.name === "AbortError") return;
      setError(toMessage(apiError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return { bookings, loading, error, refresh: () => load() };
}
