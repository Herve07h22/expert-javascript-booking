import { useState, useEffect } from "react";
import { api } from "../api";
import { toMessage } from "../errorMessages";

/**
 * Le jeton vit désormais dans un cookie HttpOnly : le frontend ne le voit
 * jamais. Il demande au serveur qui il est.
 */
export function useSession() {
  const [currentUser, setCurrentUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let obsolete = false;
    api
      .me()
      .then(({ data }) => !obsolete && setCurrentUser(data))
      .catch(() => {}) // 401 au démarrage : simplement pas connecté
      .finally(() => !obsolete && setReady(true));
    return () => {
      obsolete = true;
    };
  }, []);

  // Le mot de passe entre ici, part dans la requête, et n'est rangé nulle part.
  const logIn = async ({ email, password }) => {
    setPending(true);
    try {
      const { data } = await api.logIn({ email, password });
      setError(null);
      setCurrentUser(data);
    } catch (apiError) {
      setError(toMessage(apiError));
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
