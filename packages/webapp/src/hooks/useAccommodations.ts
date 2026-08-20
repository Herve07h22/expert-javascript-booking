import { useReducer, useEffect, useCallback } from "react";
import { Stay, Occupancy } from "@booking/core";
import { api, ApiError } from "../api.js";
import { loaderReducer } from "../types.js";
import type { Accommodation, Criteria, Loader } from "../types.js";

/**
 * La validation côté serveur est une GARANTIE. Celle-ci est un CONFORT :
 * elle évite un aller-retour pour dire que le départ précède l'arrivée.
 * Ce n'est pas la même règle écrite deux fois — c'est le MÊME code.
 */
function invalid(criteria: Criteria): ApiError | null {
  const stay = Stay.parse(criteria);
  if (stay.isError()) return new ApiError(0, stay.error.code, stay.error.details);
  const guests = Occupancy.of(criteria);
  if (guests.isError())
    return new ApiError(0, guests.error.code, guests.error.details);
  return null;
}

export function useAccommodations(criteria: Criteria) {
  const [state, dispatch] = useReducer(
    loaderReducer<Accommodation[]>,
    { state: "idle" } as Loader<Accommodation[]>
  );

  const { from, to, adults, children } = criteria;

  const load = useCallback(
    async (signal?: AbortSignal) => {
      const criteriaNow = { from, to, adults, children };
      const rejected = invalid(criteriaNow);
      if (rejected) {
        dispatch({ type: "failed", error: rejected });
        return;
      }
      dispatch({ type: "started" });
      try {
        const { data } = await api.availableAccommodations(criteriaNow, signal);
        dispatch({ type: "succeeded", value: data });
      } catch (error) {
        // Une requête annulée par nous-mêmes n'est pas un échec.
        if ((error as Error).name === "AbortError") return;
        dispatch({ type: "failed", error: error as ApiError });
      }
    },
    // Ne mettez que des primitives dans un tableau de dépendances :
    // React les compare avec Object.is, donc par référence.
    [from, to, adults, children]
  );

  useEffect(() => {
    // L'AbortController remplace le drapeau `obsolete` : il a le bon goût
    // d'annuler aussi la requête réseau.
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return { state, refresh: () => load() };
}
