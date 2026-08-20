import { useReducer, useEffect, useCallback } from "react";
import { api, ApiError } from "../api.js";
import { loaderReducer } from "../types.js";
import type { BookingView, Loader } from "../types.js";

export function useMyBookings() {
  const [state, dispatch] = useReducer(
    loaderReducer<BookingView[]>,
    { state: "idle" } as Loader<BookingView[]>
  );

  const load = useCallback(async (signal?: AbortSignal) => {
    dispatch({ type: "started" });
    try {
      const { data } = await api.myBookings(signal);
      dispatch({ type: "succeeded", value: data });
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      dispatch({ type: "failed", error: error as ApiError });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return { state, refresh: () => load() };
}
