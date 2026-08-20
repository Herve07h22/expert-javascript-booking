import { useState, useEffect } from "react";

/**
 * L'adresse d'une page EST la page : le bouton retour, le favori et le F5
 * doivent fonctionner. Dès la troisième page ou le premier paramètre d'URL,
 * prenez un vrai routeur — le but ici est de montrer qu'il n'y a aucune magie.
 */
export function useRouter(): [string, (to: string) => void] {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    // Sans cet abonnement, l'application ignore le bouton "précédent".
    // C'est le bug numéro un des routeurs maison.
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    // Ce qu'on branche au montage, on le débranche au démontage.
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (to: string) => {
    // pushState : changer de page DOIT créer une entrée d'historique.
    window.history.pushState(null, "", to);
    setPath(to);
  };

  return [path, navigate];
}
