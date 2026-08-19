import { useState } from "react";
import PropTypes from "prop-types";
import { Layout } from "../components/Layout";
import { Accommodation } from "../components/Accommodation";
import { useAccommodations } from "../hooks/useAccommodations";
import { readCriteria, writeCriteria } from "../criteria";
import { api } from "../api";
import { toMessage } from "../errorMessages";

function HomePage({ currentUser, onLogOut, navigate }) {
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
    try {
      await api.book({ accommodationId, ...criteria });
      setActionError(null);
      await refresh();
    } catch (error) {
      // La session a expiré entre l'affichage et le clic.
      if (error.status === 401) return onLogOut();

      // Le seul cas où l'erreur nous apprend que l'ÉCRAN est périmé.
      if (error.code === "ACCOMMODATION_NOT_AVAILABLE") {
        setActionError(toMessage(error));
        await refresh();
        return;
      }
      setActionError(toMessage(error));
    } finally {
      setBooking(null);
    }
  };

  return (
    <Layout
      loading={loading}
      error={actionError ?? loaderError}
      criteria={criteria}
      onChange={onChange}
      currentUser={currentUser}
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
  currentUser: PropTypes.object.isRequired,
  onLogOut: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
};

export default HomePage;
