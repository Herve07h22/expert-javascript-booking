import "./App.css";
import { useSession } from "./hooks/useSession.js";
import { useRouter } from "./hooks/useRouter.js";
import { LoginPage } from "./pages/LoginPage.js";
import { HomePage } from "./pages/HomePage.js";
import { MyBookingsPage } from "./pages/MyBookingsPage.js";

export function App() {
  const { currentUser, ready, error, pending, logIn, logOut } = useSession();
  const [path, navigate] = useRouter();

  // Tant qu'on ne sait pas qui est l'utilisateur, on n'affiche pas un écran
  // de connexion à quelqu'un qui est déjà connecté.
  if (!ready) return <div className="loading">Chargement…</div>;

  // L'affichage est une fonction de l'état. Notre application en a deux :
  // connecté, ou non.
  if (!currentUser) {
    return (
      <LoginPage
        onSubmit={(credentials) => void logIn(credentials)}
        error={error}
        pending={pending}
      />
    );
  }

  const page = {
    currentUser,
    onLogOut: () => void logOut(),
    navigate,
  };

  return path === "/bookings" ? (
    <MyBookingsPage {...page} />
  ) : (
    <HomePage {...page} />
  );
}

export default App;
