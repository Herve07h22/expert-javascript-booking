import PropTypes from "prop-types";
import "./Accommodation.css";

function Accommodation({ accommodation, onBook, booking }) {
  return (
    <div className="accommodation-card">
      <img
        src={accommodation.imageUrl}
        alt={accommodation.name}
        className="accommodation-image"
      />
      <div className="accommodation-details">
        <div className="accommodation-header">
          <h2>{accommodation.name}</h2>
          <button className="favorite-button">❤️</button>
        </div>
        <p className="accommodation-location">{accommodation.location}</p>
        <p className="accommodation-host">{accommodation.host}</p>
        <p className="accommodation-price">{accommodation.price} € par nuit</p>
        {/* Une commande : deux clics créeraient deux réservations. */}
        <button className="book-button" onClick={onBook} disabled={booking}>
          {booking ? "Réservation…" : "Réserver"}
        </button>
      </div>
    </div>
  );
}

Accommodation.propTypes = {
  accommodation: PropTypes.object.isRequired,
  onBook: PropTypes.func,
  booking: PropTypes.bool,
};

export { Accommodation };
