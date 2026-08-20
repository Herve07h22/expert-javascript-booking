import type { Accommodation as AccommodationView } from "../types.js";
import "./Accommodation.css";

export function Accommodation({
  accommodation,
  onBook,
  booking,
}: {
  accommodation: AccommodationView;
  onBook: () => void;
  booking: boolean;
}) {
  return (
    <article className="accommodation-card" aria-label={accommodation.name}>
      <img
        src={accommodation.imageUrl}
        alt=""
        className="accommodation-image"
      />
      <div className="accommodation-details">
        <div className="accommodation-header">
          {/* Le nom du logement en titre, la ville en paragraphe : l'inverse
              de ce que le modèle avait produit au chapitre 25. */}
          <h2>{accommodation.name}</h2>
          <button type="button" className="favorite-button" aria-label="Favori">
            ❤️
          </button>
        </div>
        <p className="accommodation-location">{accommodation.location}</p>
        <p className="accommodation-host">{accommodation.host}</p>
        <p className="accommodation-price">{accommodation.price} € par nuit</p>
        {/* Une commande : deux clics créeraient deux réservations. */}
        <button
          type="button"
          className="book-button"
          onClick={onBook}
          disabled={booking}
        >
          {booking ? "Réservation…" : "Réserver"}
        </button>
      </div>
    </article>
  );
}
