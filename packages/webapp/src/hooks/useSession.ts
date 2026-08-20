import { useState, useEffect } from "react";
import { api, ApiError } from "../api.js";
import { toMessage } from "../errorMessages.js";
import type { CurrentUser } from "../types.js";

/**
 * Le jeton vit dans un cookie HttpOnly : le frontend ne le voit jamais.
 * Il demande donc au serveur qui il est.
 */
export function useSession() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let obsolete = false;
    api
      .me()
      .then(({ data }) => {
        if (!obsolete) setCurrentUser(data);
      })
      .catch(() => {}) // 401 au démarrage : simplement pas connecté
      .finally(() => {
        if (!obsolete) setReady(true);
      });
    return () => {
      obsolete = true;
    };
  }, []);

  // Le mot de passe entre ici, part dans la requête, et n'est rangé nulle part.
  const logIn = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    setPending(true);
    try {
      const { data } = await api.logIn({ email, password });
      setError(null);
      setCurrentUser(data);
    } catch (apiError) {
      setError(toMessage(apiError as ApiError));
    } finally {
      setPending(false);
    }
  };

  const logOut = async () => {
    // Effacer le ticket ne suffit pas : il faut le faire annuler au vestiaire.
    await api.logOut().catch(() => {});
    setCurrentUser(null);
  };

  return { currentUser, ready, error, pending, logIn, logOut };
}
