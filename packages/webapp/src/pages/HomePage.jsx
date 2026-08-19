import { useState } from "react";
import { App, book, login, testDependencies, Stay, Occupancy } from "@booking/core";
import { Layout } from "../components/Layout";
import { Accommodation } from "../components/Accommodation";
import { useAccommodations } from "../hooks/useAccommodations";
import { readCriteria, writeCriteria } from "../criteria";

// L'application est initialisée une seule fois, dans le module.
const app = new App(testDependencies());

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

export async function action(accommodationId, criteria) {
  const session = await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
    book({
      accommodationId,
      adults: criteria.adults,
      children: criteria.children,
      from: criteria.from,
      to: criteria.to,
    }),
  ]);
  return session.error
    ? { status: "error", error: session.error.message }
    : { status: "ok" };
}

function HomePage() {
  // useState(readCriteria) : la fonction, pas son appel. React ne l'exécute
  // qu'une fois, au premier rendu.
  const [criteria, setCriteria] = useState(readCriteria);
  const { accommodations, loading, error: loaderError, refresh } =
    useAccommodations(criteria);
  const [actionError, setActionError] = useState(null);

  const onChange = (next) => {
    setCriteria(next);
    writeCriteria(next);
  };

  const onBook = async (accommodationId) => {
    const { status, error } = await action(accommodationId, criteria);
    if (status === "ok") {
      setActionError(null);
      await refresh();
    } else {
      setActionError(error);
    }
  };

  return (
    <Layout
      loading={loading}
      error={actionError ?? loaderError}
      criteria={criteria}
      onChange={onChange}
    >
      {accommodations.map((accommodation) => (
        <Accommodation
          key={accommodation.id}
          accommodation={accommodation}
          onBook={() => onBook(accommodation.id)}
        />
      ))}
    </Layout>
  );
}

export default HomePage;
