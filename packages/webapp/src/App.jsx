import "./App.css";
import { useSession } from "./hooks/useSession";
import { useRouter } from "./hooks/useRouter";
import { LoginPage } from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import MyBookingsPage from "./pages/MyBookingsPage";

function App() {
  const { currentUser, ready, error, pending, logIn, logOut } = useSession();
  const [path, navigate] = useRouter();

  // Tant qu'on ne sait pas qui est l'utilisateur, on n'affiche pas un écran
  // de connexion à quelqu'un qui est déjà connecté.
  if (!ready) return <div className="loading">Chargement…</div>;

  if (!currentUser) {
    return <LoginPage onSubmit={logIn} error={error} pending={pending} />;
  }

  const page = { currentUser, onLogOut: logOut, navigate };

  return path === "/bookings" ? (
    <MyBookingsPage {...page} />
  ) : (
    <HomePage {...page} />
  );
}

export default App;
