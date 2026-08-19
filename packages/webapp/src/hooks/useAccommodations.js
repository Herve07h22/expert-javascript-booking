import { useState, useEffect } from "react";
import { loader } from "../pages/HomePage";

export function useAccommodations() {
  // Nos 2 états sur la page
  const [loading, setLoading] = useState(false);
  const [accommodations, setAccommodations] = useState([]);

  // Une fonction qui orchestre les changements d'état
  const loadAccommodations = async () => {
    setLoading(true);
    setAccommodations(await loader());
    setLoading(false);
  };

  // Un effet
  useEffect(() => {
    loadAccommodations();
  }, []);

  return { accommodations, loading, refresh: loadAccommodations };
}
