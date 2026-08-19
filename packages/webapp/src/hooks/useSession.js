import { useState } from "react";
import { login, logout } from "@booking/core";
import { app } from "../domain";

// Pis-aller assumé et TEMPORAIRE : localStorage est lisible par tout le
// JavaScript de la page. Dès qu'il y a un vrai serveur, le jeton part dans
// un cookie HttpOnly, et le frontend ne le voit plus jamais (chapitre 40).
const STORAGE_KEY = "session";

function readStoredSession() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}

function storeSession(session) {
  if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  else window.localStorage.removeItem(STORAGE_KEY);
}

export function useSession() {
  const [session, setSession] = useState(readStoredSession);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  // Le mot de passe entre ici, part dans la commande, et n'est rangé nulle part.
  const logIn = async ({ email, password }) => {
    setPending(true);
    const context = await app.run([login({ email, password })]);
    const result = context.session();
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setError(null);
    setSession(result);
    storeSession(result);
  };

  const logOut = async () => {
    if (session) await app.run([logout(session.token)]);
    setSession(null);
    storeSession(null);
  };

  return { session, error, pending, logIn, logOut };
}
