import { Layout } from "../components/Layout";
import { Accomodation } from "../components/Accomodation";
import { useAccomodations } from "../hooks/useAccomodations";
import { App } from "@booking/core/domain/app/App";
import { testDependencies } from "@booking/core/infra/testDependencies";
import { login } from "@booking/core/domain/usecases/login";
import { book } from "@booking/core/domain/usecases/book";

export async function loader() {
  const app = new App(testDependencies());
  return app.dependencies.bookings.getAccomodations();
}
export async function action() {
  const app = new App(testDependencies());
  const session = await app.run([
    login({ email: "faketenant@mail.com", password: "secret" }),
    book({
      accomodationId: "accomodation-1",
      adults: 2,
      children: 3,
      from: new Date("2024-06-02"),
      to: new Date("2024-06-04"),
    }),
  ]);
  return session.error
    ? { status: "error", error: session.error }
    : { status: "ok" };
}

function HomePage() {
  const { accomodations, loading } = useAccomodations();

  return (
    <Layout loading={loading}>
      {accomodations.map((accomodation) => (
        <Accomodation
          key={accomodation.id}
          accomodation={accomodation}
          onBook={action}
        />
      ))}
    </Layout>
  );
}

export default HomePage;
