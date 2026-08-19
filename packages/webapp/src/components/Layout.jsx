import PropTypes from "prop-types";
import { Link } from "./Link";
import "./Layout.css";

function Layout({
  children,
  loading,
  error,
  criteria,
  onChange,
  currentUser,
  onLogOut,
  navigate,
}) {
  const update = (patch) => onChange({ ...criteria, ...patch });

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
          {currentUser && <span className="nav-user">{currentUser.email}</span>}
          <button type="button" className="link-button" onClick={onLogOut}>
            Se déconnecter
          </button>
        </nav>

        {criteria && (
          <div className="search-bar">
            <label htmlFor="from">Arrivée</label>
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
            <input
              id="adults"
              type="number"
              min="1"
              value={criteria.adults}
              // La valeur d'un input est TOUJOURS une chaîne, même en type="number".
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

Layout.propTypes = {
  children: PropTypes.node,
  loading: PropTypes.bool,
  error: PropTypes.string,
  criteria: PropTypes.object,
  onChange: PropTypes.func,
  currentUser: PropTypes.object,
  onLogOut: PropTypes.func,
  navigate: PropTypes.func.isRequired,
};

export { Layout };
