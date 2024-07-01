import { Layout } from "../components/Layout";
import { Accomodation } from "../components/Accomodation";
import { useAccomodations } from "../hooks/useAccomodations";
import { App } from "@booking/core/domain/app/App";
import { testDependencies } from "@booking/core/infra/testDependencies";
import { login } from "@booking/core/domain/usecases/login";
import { book } from "@booking/core/domain/usecases/book";
import { toDate } from "@booking/core/domain/app/dates";

const app = new App(testDependencies());

export async function loader() {
  return  await app.dependencies.bookings.getAvailableAccomodations({
    from: toDate("2024-06-02"),
    to: toDate("2024-06-04"),
  });
}

export async function action() {
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
  console.log(session)
  return session.error
    ? { status: "error", error: session.error }
    : { status: "ok" };
}

function HomePage() {
  const { accomodations, loading, refresh } = useAccomodations();

  return (
    <Layout loading={loading}>
      {accomodations.map((accomodation) => (
        <Accomodation
          key={accomodation.id}
          accomodation={accomodation}
          onBook={() => action().then(({status}) => status === "ok" ?  refresh() : {})}
        />
      ))}
    </Layout>
  );
}

export default HomePage;
