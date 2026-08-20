import { useState } from "react";
import type { ReactNode } from "react";
import { Layout } from "../components/Layout.js";
import { Accommodation } from "../components/Accommodation.js";
import { Link } from "../components/Link.js";
import { useAccommodations } from "../hooks/useAccommodations.js";
import { readCriteria, writeCriteria } from "../criteria.js";
import { api, ApiError } from "../api.js";
import { toMessage } from "../errorMessages.js";
import type {
  Accommodation as AccommodationView,
  Criteria,
  CurrentUser,
} from "../types.js";

interface PageProps {
  currentUser: CurrentUser;
  onLogOut: () => void;
  navigate: (to: string) => void;
}

export function HomePage({ currentUser, onLogOut, navigate }: PageProps) {
  // useState(readCriteria) : la fonction, pas son appel. React ne l'exécute
  // qu'une fois, au premier rendu.
  const [criteria, setCriteria] = useState<Criteria>(readCriteria);
  const { state, refresh } = useAccommodations(criteria);
  const [actionError, setActionError] = useState<string | null>(null);
  const [booking, setBooking] = useState<string | null>(null);

  const onChange = (next: Criteria) => {
    setCriteria(next);
    writeCriteria(next);
  };

  const onBook = async (accommodationId: string) => {
    setBooking(accommodationId);
    try {
      await api.book({ accommodationId, ...criteria });
      setActionError(null);
      await refresh();
    } catch (error) {
      const apiError = error as ApiError;
      // La session a expiré entre l'affichage de la page et le clic.
      if (apiError.status === 401) return onLogOut();

      // Le seul cas où l'erreur nous apprend que l'ÉCRAN est périmé :
      // laisser la carte affichée invite à recliquer pour la même erreur.
      if (apiError.code === "ACCOMMODATION_NOT_AVAILABLE") {
        setActionError(toMessage(apiError));
        await refresh();
        return;
      }
      setActionError(toMessage(apiError));
    } finally {
      setBooking(null);
    }
  };

  const list = (accommodations: AccommodationView[], dimmed = false) => (
    <div className={dimmed ? "accommodations-list dimmed" : "accommodations-list"}>
      {accommodations.map((accommodation) => (
        <Accommodation
          key={accommodation.id}
          accommodation={accommodation}
          booking={booking === accommodation.id}
          onBook={() => void onBook(accommodation.id)}
        />
      ))}
    </div>
  );

  const shell = (children: ReactNode, loading = false) => (
    <Layout
      loading={loading}
      error={actionError}
      criteria={criteria}
      onChange={onChange}
      currentUser={currentUser}
      onLogOut={onLogOut}
      navigate={navigate}
    >
      {children}
    </Layout>
  );

  // Quatre états, quatre écrans. Dans la branche "loaded", `state.value`
  // EXISTE : TypeScript le sait, il n'y a rien à vérifier.
  switch (state.state) {
    case "idle":
      return shell(<p className="empty">Choisissez vos dates.</p>);

    case "loading":
      // On garde la liste précédente, grisée : sinon l'écran clignote et
      // l'utilisateur perd sa position de défilement.
      return state.previous
        ? shell(list(state.previous, true))
        : shell(null, true);

    case "loaded":
      return shell(
        state.value.length === 0 ? (
          // Un état vide est un écran, pas un oubli.
          <div className="empty">
            <p>Aucun logement disponible pour ces critères.</p>
            <p>
              Essayez d&apos;élargir les dates ou de réduire le nombre de
              voyageurs.
            </p>
          </div>
        ) : (
          list(state.value)
        )
      );

    case "failed":
      // Une erreur réseau est souvent passagère : sans bouton, l'utilisateur
      // doit recharger la page et perd sa recherche.
      return shell(
        <div className="empty">
          <p role="alert">{toMessage(state.error)}</p>
          <button type="button" onClick={() => void refresh()}>
            Réessayer
          </button>{" "}
          <Link to="/bookings" navigate={navigate}>
            Voir mes réservations
          </Link>
        </div>
      );

    default: {
      // Ajoutez un cinquième état et le compilateur signalera TOUS les
      // switch incomplets de l'application.
      const impossible: never = state;
      throw new Error(`Unhandled state ${JSON.stringify(impossible)}`);
    }
  }
}
