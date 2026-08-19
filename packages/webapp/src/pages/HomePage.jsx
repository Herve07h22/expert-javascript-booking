import { useState } from "react";
import PropTypes from "prop-types";
import { authenticate, book, Stay, Occupancy } from "@booking/core";
import { app } from "../domain";
import { Layout } from "../components/Layout";
import { Accommodation } from "../components/Accommodation";
import { useAccommodations } from "../hooks/useAccommodations";
import { readCriteria, writeCriteria } from "../criteria";

// Le loader reçoit des chaînes venues d'un humain : il peut échouer.
// Aucune règle n'est réécrite ici, Stay et Occupancy les portent déjà.
export async function loader({ from, to, adults, children }) {
  const stay = Stay.parse({ from, to });
  if (stay.isError()) {
    return { accommodations: [], error: stay.error.message };
  }
  const guests = Occupancy.of({ adults, children });
  if (guests.isError()) {
    return { accommodations: [], error: guests.error.message };
  }

  const accommodations =
    await app.dependencies.bookings.getAvailableAccommodations(
      stay.value,
      guests.value
    );
  return { accommodations, error: null };
}

export async function action(session, accommodationId, criteria) {
  const context = await app.run([
    authenticate(session.token),
    book({
      accommodationId,
      adults: criteria.adults,
      children: criteria.children,
      from: criteria.from,
      to: criteria.to,
    }),
  ]);
  return context.session();
}

function HomePage({ session, onLogOut, navigate }) {
  // useState(readCriteria) : la fonction, pas son appel.
  const [criteria, setCriteria] = useState(readCriteria);
  const {
    accommodations,
    loading,
    error: loaderError,
    refresh,
  } = useAccommodations(criteria);
  const [actionError, setActionError] = useState(null);
  const [booking, setBooking] = useState(null);

  const onChange = (next) => {
    setCriteria(next);
    writeCriteria(next);
  };

  const onBook = async (accommodationId) => {
    setBooking(accommodationId);
    const result = await action(session, accommodationId, criteria);
    setBooking(null);

    if (result.error === "Invalid or expired session") {
      // La session a expiré entre l'affichage et le clic.
      return onLogOut();
    }
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
      error={actionError ?? loaderError}
      criteria={criteria}
      onChange={onChange}
      currentUser={session.currentUser}
      onLogOut={onLogOut}
      navigate={navigate}
    >
      <div className="accommodations-list">
        {accommodations.length === 0 ? (
          <p className="empty">Aucun logement disponible pour ces critères.</p>
        ) : (
          accommodations.map((accommodation) => (
            <Accommodation
              key={accommodation.id}
              accommodation={accommodation}
              booking={booking === accommodation.id}
              onBook={() => onBook(accommodation.id)}
            />
          ))
        )}
      </div>
    </Layout>
  );
}

HomePage.propTypes = {
  session: PropTypes.object.isRequired,
  onLogOut: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
};

export default HomePage;
