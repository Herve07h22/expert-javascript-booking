import PropTypes from "prop-types";
import "./Accomodation.css";

function Accomodation({ accomodation, onBook }) {
  return (
    <div className="accomodation-card">
      <img
        src={accomodation.imageUrl}
        alt={accomodation.name}
        className="accomodation-image"
      />
      <div className="accomodation-details">
        <div className="accomodation-header">
          <h2>{accomodation.location}</h2>
          <button className="favorite-button">❤️</button>
        </div>
        <p className="accomodation-name">{accomodation.name}</p>
        <p className="accomodation-dates">{accomodation.dates}</p>
        <p className="accomodation-host">{accomodation.host}</p>
        <p className="accomodation-price">{accomodation.price} € par nuit</p>
        <button className="book-button" onClick={onBook}>
          Réserver
        </button>
      </div>
    </div>
  );
}

Accomodation.propTypes = {
  accomodation: PropTypes.object.isRequired,
  onBook: PropTypes.func,
};

export { Accomodation };
