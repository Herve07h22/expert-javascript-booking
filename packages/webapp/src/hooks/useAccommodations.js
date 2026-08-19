import { useState, useEffect, useCallback } from "react";
import { Stay, Occupancy } from "@booking/core";
import { api } from "../api";
import { toMessage } from "../errorMessages";

/**
 * La validation côté serveur est une GARANTIE. Celle-ci est un CONFORT :
 * elle évite un aller-retour pour dire que le départ précède l'arrivée.
 * Ce n'est pas la même règle écrite deux fois — c'est le MÊME code.
 */
function parse({ from, to, adults, children }) {
  const stay = Stay.parse({ from, to });
  if (stay.isError()) return stay.error;
  const guests = Occupancy.of({ adults, children });
  if (guests.isError()) return guests.error;
  return null;
}

export function useAccommodations(criteria) {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { from, to, adults, children } = criteria;

  const load = useCallback(
    async (signal) => {
      const invalid = parse({ from, to, adults, children });
      if (invalid) {
        setAccommodations([]);
        setError(toMessage(invalid));
        return;
      }
      setLoading(true);
      try {
        const { data } = await api.availableAccommodations(
          { from, to, adults, children },
          signal
        );
        setAccommodations(data);
        setError(null);
      } catch (apiError) {
        if (apiError.name === "AbortError") return;
        setError(toMessage(apiError));
      } finally {
        setLoading(false);
      }
    },
    [from, to, adults, children]
  );

  useEffect(() => {
    // L'AbortController remplace le drapeau `obsolete` : il a le bon goût
    // d'annuler aussi la requête réseau.
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return { accommodations, loading, error, refresh: () => load() };
}
