import type { ReactNode } from "react";
import { Link } from "./Link.js";
import type { Criteria, CurrentUser } from "../types.js";
import "./Layout.css";

interface LayoutProps {
  children: ReactNode;
  loading?: boolean;
  error?: string | null;
  criteria?: Criteria;
  onChange?: (criteria: Criteria) => void;
  currentUser: CurrentUser;
  onLogOut: () => void;
  navigate: (to: string) => void;
}

export function Layout({
  children,
  loading,
  error,
  criteria,
  onChange,
  currentUser,
  onLogOut,
  navigate,
}: LayoutProps) {
  const update = (patch: Partial<Criteria>) => {
    if (criteria && onChange) onChange({ ...criteria, ...patch });
  };

  return (
    <div className="layout">
      <header className="header">
        <nav className="nav">
          <Link to="/" navigate={navigate}>
            Logements
          </Link>
          <Link to="/bookings" navigate={navigate}>
            Mes réservations
          </Link>
          <span className="nav-spacer" />
          <span className="nav-user">{currentUser.email}</span>
          <button type="button" className="link-button" onClick={onLogOut}>
            Se déconnecter
          </button>
        </nav>

        {criteria && (
          <div className="search-bar">
            <label htmlFor="from">Arrivée</label>
            {/* type="date" : le navigateur parle déjà ISO-8601, exactement le
                format que CalendarDay.parse attend. */}
            <input
              id="from"
              type="date"
              value={criteria.from}
              onChange={(e) => update({ from: e.target.value })}
            />

            <label htmlFor="to">Départ</label>
            <input
              id="to"
              type="date"
              value={criteria.to}
              onChange={(e) => update({ to: e.target.value })}
            />

            <label htmlFor="adults">Adultes</label>
            {/* La valeur d'un input est TOUJOURS une chaîne, même en number. */}
            <input
              id="adults"
              type="number"
              min="1"
              value={criteria.adults}
              onChange={(e) => update({ adults: Number(e.target.value) })}
            />

            <label htmlFor="children">Enfants</label>
            <input
              id="children"
              type="number"
              min="0"
              value={criteria.children}
              onChange={(e) => update({ children: Number(e.target.value) })}
            />
          </div>
        )}
      </header>

      <main className="main-content">
        {error && (
          <div role="alert" className="error">
            {error}
          </div>
        )}
        {loading ? <div className="loading">Loading...</div> : children}
      </main>
    </div>
  );
}
