import type { Accommodation, BookingView, Criteria, CurrentUser } from "./types.js";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: Record<string, unknown>;

  constructor(status: number, code: string, details?: Record<string, unknown>) {
    super(code);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details ?? {};
  }
}

interface Envelope<T> {
  data: T;
}

const request = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<Envelope<T>> => {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      // Sans cette ligne, fetch n'envoie pas les cookies dès que l'origine
      // diffère : on obtient un 401 alors que la session existe.
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (error) {
    if ((error as Error).name === "AbortError") throw error;
    // fetch ne rejette QUE sur une panne réseau.
    throw new ApiError(0, "NETWORK_ERROR");
  }

  if (response.status === 204) return { data: null as T };

  // Un 502 renvoyé par un proxy est du HTML, pas du JSON.
  const body = (await response.json().catch(() => ({}))) as {
    data?: T;
    error?: { code?: string; details?: Record<string, unknown> };
  };

  // fetch ne lève pas d'exception sur un 404 ou un 500 : `ok` est le seul test.
  if (!response.ok) {
    throw new ApiError(
      response.status,
      body.error?.code ?? "INTERNAL_ERROR",
      body.error?.details
    );
  }
  return { data: body.data as T };
};

export const api = {
  me: (signal?: AbortSignal) => request<CurrentUser>("/me", { signal }),

  logIn: (credentials: { email: string; password: string }) =>
    request<CurrentUser>("/sessions", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  logOut: () => request<null>("/sessions", { method: "DELETE" }),

  availableAccommodations: (criteria: Criteria, signal?: AbortSignal) =>
    request<Accommodation[]>(
      `/accommodations?${new URLSearchParams(
        Object.entries(criteria).map(([k, v]) => [k, String(v)])
      )}`,
      { signal }
    ),

  myBookings: (signal?: AbortSignal) =>
    request<BookingView[]>("/bookings", { signal }),

  book: (payload: Criteria & { accommodationId: string }) =>
    request<null>("/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  cancel: (bookingId: string) =>
    request<null>(`/bookings/${bookingId}/cancellation`, { method: "POST" }),
};
