import { useState } from "react";
import { App, book, login, testDependencies, Stay } from "@booking/core";
import { Layout } from "../components/Layout";
import { Accommodation } from "../components/Accommodation";
import { useAccommodations } from "../hooks/useAccommodations";

// L'application est initialisée une seule fois, dans le module.
// Surtout pas dans le loader ou l'action : les dépendances seraient
// réinitialisées à chaque appel, et l'état reviendrait à l'état initial.
const app = new App(testDependencies());

// Les dates du séjour recherché. Elles viendront du bandeau de recherche plus tard.
const searched = Stay.parse({ from: "2024-06-02", to: "2024-06-04" }).value;

export async function loader() {
  return await app.dependencies.bookings.getAvailableAccommodations(searched);
}

export async function action(accommodationId) {
  const session = await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
    book({
      accommodationId,
      adults: 2,
      children: 3,
      from: "2024-06-02",
      to: "2024-06-04",
    }),
  ]);
  return session.error
    ? { status: "error", error: session.error.message }
    : { status: "ok" };
}

function HomePage() {
  const { accommodations, loading, refresh } = useAccommodations();
  const [error, setError] = useState(null);

  const onBook = async (accommodationId) => {
    const { status, error } = await action(accommodationId);
    if (status === "ok") {
      setError(null);
      await refresh();
    } else {
      setError(error);
    }
  };

  return (
    <Layout loading={loading} error={error}>
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
