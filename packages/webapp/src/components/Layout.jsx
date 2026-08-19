import PropTypes from "prop-types";
import "./Layout.css";

function Layout({ children, loading, error }) {
  return (
    <div className="layout">
      <header className="header">
        <div className="search-bar">
          <input type="text" placeholder="Rechercher une destination" />
          <input type="text" placeholder="Arrivée" />
          <input type="text" placeholder="Départ" />
          <input type="text" placeholder="Ajouter des voyageurs" />
          <button className="search-button">🔍</button>
        </div>
      </header>
      <main className="main-content">
        {error && (
          <div role="alert" className="error">
            {error}
          </div>
        )}
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="accommodations-list">{children}</div>
        )}
      </main>
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node,
  loading: PropTypes.bool,
  error: PropTypes.string,
};

export { Layout };
