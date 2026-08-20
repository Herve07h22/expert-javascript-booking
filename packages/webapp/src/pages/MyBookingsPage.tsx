import { useState } from "react";
import type { ReactNode } from "react";
import { Layout } from "../components/Layout.js";
import { Link } from "../components/Link.js";
import { useMyBookings } from "../hooks/useMyBookings.js";
import { formatDay, formatPrice } from "../format.js";
import { api, ApiError } from "../api.js";
import { toMessage } from "../errorMessages.js";
import type { BookingView, CurrentUser } from "../types.js";
import "./MyBookingsPage.css";

interface PageProps {
  currentUser: CurrentUser;
  onLogOut: () => void;
  navigate: (to: string) => void;
}

export function MyBookingsPage({
  currentUser,
  onLogOut,
  navigate,
}: PageProps) {
  const { state, refresh } = useMyBookings();
  const [actionError, setActionError] = useState<string | null>(null);

  const onCancel = async (bookingId: string) => {
    try {
      await api.cancel(bookingId);
      setActionError(null);
      await refresh();
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.status === 401) return onLogOut();
      setActionError(toMessage(apiError));
    }
  };

  const shell = (children: ReactNode, loading = false) => (
    <Layout
      loading={loading}
      error={actionError}
      currentUser={currentUser}
      onLogOut={onLogOut}
      navigate={navigate}
    >
      {children}
    </Layout>
  );

  const list = (bookings: BookingView[]) => (
    <ul className="bookings">
      {bookings.map((booking) => (
        <li
          key={booking.id}
          className={booking.status === "cancelled" ? "cancelled" : ""}
        >
          <img src={booking.imageUrl} alt="" />
          <div>
            <h2>{booking.name}</h2>
            <p>{booking.location}</p>
            <p>
              Du {formatDay(booking.from)} au {formatDay(booking.to)}
            </p>
            <p>
              {booking.nights} nuits · {booking.guests} voyageurs ·{" "}
              {formatPrice(booking.price)}
            </p>
            {booking.status === "cancelled" ? (
              // On ne masque pas : un utilisateur qui ne retrouve pas sa
              // réservation annulée croit qu'elle est toujours active.
              <p className="badge">Annulée</p>
            ) : (
              booking.cancellable && (
                <button type="button" onClick={() => void onCancel(booking.id)}>
                  Annuler
                </button>
              )
            )}
          </div>
        </li>
      ))}
    </ul>
  );

  switch (state.state) {
    case "idle":
    case "loading":
      return state.state === "loading" && state.previous
        ? shell(list(state.previous))
        : shell(null, true);

    case "loaded":
      return shell(
        state.value.length === 0 ? (
          <div className="empty">
            <p>Vous n&apos;avez aucune réservation.</p>
            <Link to="/" navigate={navigate}>
              Chercher un logement
            </Link>
          </div>
        ) : (
          list(state.value)
        )
      );

    case "failed":
      return shell(
        <div className="empty">
          <p role="alert">{toMessage(state.error)}</p>
          <button type="button" onClick={() => void refresh()}>
            Réessayer
          </button>
        </div>
      );

    default: {
      const impossible: never = state;
      throw new Error(`Unhandled state ${JSON.stringify(impossible)}`);
    }
  }
}
