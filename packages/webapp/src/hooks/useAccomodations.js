import { useState, useEffect } from "react";
import { loader  } from "../pages/HomePage";

export function useAccomodations() {
  // Nos 2 états sur la page
  const [loading, setLoading] = useState(false);
  const [accomodations, setAccomodations] = useState([]);
  // Une fonction qui orchestre les changements d'état
  const loadAccomodation = async () => {
    setLoading(true);
    setAccomodations(await loader());
    setLoading(false);
  };
  // Un effet
  useEffect(() => {
    loadAccomodation();
  }, []);
  return { accomodations, loading };
}
