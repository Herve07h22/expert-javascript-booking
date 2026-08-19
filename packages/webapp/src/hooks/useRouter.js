import { useState, useEffect } from "react";

/**
 * L'adresse d'une page EST la page : le bouton retour, le favori et le F5
 * doivent fonctionner. Dès la troisième page ou le premier paramètre d'URL,
 * prenez un vrai routeur.
 */
export function useRouter() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    // Sans cet abonnement, l'application ignore le bouton "précédent".
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (to) => {
    // pushState : changer de page DOIT créer une entrée d'historique.
    window.history.pushState(null, "", to);
    setPath(to);
  };

  return [path, navigate];
}
