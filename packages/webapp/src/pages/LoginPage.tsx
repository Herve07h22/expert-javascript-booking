import { useState } from "react";
import type { FormEvent } from "react";
import "./LoginPage.css";

export function LoginPage({
  onSubmit,
  error,
  pending,
}: {
  onSubmit: (credentials: { email: string; password: string }) => void;
  error: string | null;
  pending: boolean;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent) => {
    // Sans cette ligne, le navigateur soumet à la façon de 1997 :
    // rechargement complet, et votre état disparaît.
    event.preventDefault();
    onSubmit({ email, password });
  };

  return (
    // Un vrai <form> : la touche Entrée valide, les gestionnaires de mots de
    // passe le reconnaissent, les lecteurs d'écran l'annoncent comme tel.
    <form className="login" onSubmit={handleSubmit}>
      <h1>Se connecter</h1>

      {/* Un placeholder n'est pas un label : il disparaît à la première frappe. */}
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

      {/* role="alert" : sans lui, un utilisateur non-voyant clique et
          n'obtient rien — le message existe, mais personne ne le lui dit. */}
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
