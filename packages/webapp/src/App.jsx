import "./App.css";
import { useSession } from "./hooks/useSession";
import { useRouter } from "./hooks/useRouter";
import { LoginPage } from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import MyBookingsPage from "./pages/MyBookingsPage";

function App() {
  const { session, error, pending, logIn, logOut } = useSession();
  const [path, navigate] = useRouter();

  // L'affichage est une fonction de l'état. Notre application en a deux :
  // connecté, ou non.
  if (!session) {
    return <LoginPage onSubmit={logIn} error={error} pending={pending} />;
  }

  const page = { session, onLogOut: logOut, navigate };

  return path === "/bookings" ? (
    <MyBookingsPage {...page} />
  ) : (
    <HomePage {...page} />
  );
}

export default App;
