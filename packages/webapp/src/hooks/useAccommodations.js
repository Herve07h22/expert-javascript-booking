import { useState, useEffect, useCallback } from "react";
import { loader } from "../pages/HomePage";

export function useAccommodations(criteria) {
  const [loading, setLoading] = useState(false);
  const [accommodations, setAccommodations] = useState([]);
  const [error, setError] = useState(null);

  const { from, to, adults, children } = criteria;

  const load = useCallback(async () => {
    setLoading(true);
    const result = await loader({ from, to, adults, children });
    setAccommodations(result.accommodations);
    setError(result.error);
    setLoading(false);
  }, [from, to, adults, children]);

  useEffect(() => {
    // Deux recherches peuvent être en vol : rien ne garantit l'ordre de retour.
    // React appelle le nettoyage avant de rejouer l'effet.
    let obsolete = false;

    (async () => {
      setLoading(true);
      const result = await loader({ from, to, adults, children });
      if (obsolete) return; // une recherche plus récente est partie : on jette
      setAccommodations(result.accommodations);
      setError(result.error);
      setLoading(false);
    })();

    return () => {
      obsolete = true;
    };
    // Ne mettez que des primitives dans un tableau de dépendances :
    // React les compare avec Object.is, donc par référence.
  }, [from, to, adults, children]);

  return { accommodations, loading, error, refresh: load };
}
