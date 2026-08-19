export class ApiError extends Error {
  constructor(status, code, details) {
    super(code);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details ?? {};
  }
}

const request = async (path, options = {}) => {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      // Sans cette ligne, fetch n'envoie pas les cookies dès que l'origine
      // diffère : on obtient un 401 alors que la session existe.
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    // fetch ne rejette QUE sur une panne réseau.
    throw new ApiError(0, "NETWORK_ERROR");
  }

  if (response.status === 204) return { data: null };

  // Un 502 renvoyé par un proxy est du HTML, pas du JSON.
  const body = await response.json().catch(() => ({}));

  // fetch ne lève pas d'exception sur un 404 ou un 500 : `ok` est le seul test.
  if (!response.ok) {
    throw new ApiError(
      response.status,
      body.error?.code ?? "INTERNAL_ERROR",
      body.error?.details
    );
  }
  return body;
};

export const api = {
  me: (signal) => request("/me", { signal }),
  logIn: (credentials) =>
    request("/sessions", { method: "POST", body: JSON.stringify(credentials) }),
  logOut: () => request("/sessions", { method: "DELETE" }),
  availableAccommodations: (criteria, signal) =>
    request(`/accommodations?${new URLSearchParams(criteria)}`, { signal }),
  myBookings: (signal) => request("/bookings", { signal }),
  book: (payload) =>
    request("/bookings", { method: "POST", body: JSON.stringify(payload) }),
  cancel: (bookingId) =>
    request(`/bookings/${bookingId}/cancellation`, { method: "POST" }),
};
