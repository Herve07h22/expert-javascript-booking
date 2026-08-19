import { useState } from "react";
import PropTypes from "prop-types";
import { authenticate, cancelBooking } from "@booking/core";
import { app } from "../domain";
import { Layout } from "../components/Layout";
import { Link } from "../components/Link";
import { useMyBookings } from "../hooks/useMyBookings";
import { formatDay, formatPrice } from "../format";
import "./MyBookingsPage.css";

export async function cancelAction(session, bookingId) {
  const context = await app.run([
    authenticate(session.token),
    cancelBooking({ bookingId }),
  ]);
  return context.session();
}

function MyBookingsPage({ session, onLogOut, navigate }) {
  const { bookings, loading, error, refresh } = useMyBookings(session);
  const [actionError, setActionError] = useState(null);

  const onCancel = async (bookingId) => {
    const result = await cancelAction(session, bookingId);
    if (result.error) {
      setActionError(result.error);
      return;
    }
    setActionError(null);
    await refresh();
  };

  return (
    <Layout
      loading={loading}
      error={actionError ?? error}
      currentUser={session.currentUser}
      onLogOut={onLogOut}
      navigate={navigate}
    >
      {bookings.length === 0 ? (
        // Un état vide est un écran, pas un oubli.
        <div className="empty">
          <p>Vous n&apos;avez aucune réservation.</p>
          <Link to="/" navigate={navigate}>
            Chercher un logement
          </Link>
        </div>
      ) : (
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
                  <p className="badge">Annulée</p>
                ) : (
                  booking.cancellable && (
                    <button type="button" onClick={() => onCancel(booking.id)}>
                      Annuler
                    </button>
                  )
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}

MyBookingsPage.propTypes = {
  session: PropTypes.object.isRequired,
  onLogOut: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
};

export default MyBookingsPage;
