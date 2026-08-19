import { useState } from "react";
import PropTypes from "prop-types";
import "./LoginPage.css";

function LoginPage({ onSubmit, error, pending }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    // Sans cette ligne, le navigateur recharge la page et l'état disparaît.
    event.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <form className="login" onSubmit={handleSubmit}>
      <h1>Se connecter</h1>

      <label htmlFor="email">Adresse email</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label htmlFor="password">Mot de passe</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      {/* Nous invoquons une commande : deux clics créeraient deux sessions. */}
      <button type="submit" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </button>

      <p className="hint">
        Compte de démonstration : faketenant@mail.com / secret
      </p>
    </form>
  );
}

LoginPage.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  error: PropTypes.string,
  pending: PropTypes.bool,
};

export { LoginPage };
