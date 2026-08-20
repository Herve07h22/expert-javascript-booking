import type { BookingView, Accommodation } from "@booking/core";

export type { BookingView, Accommodation };

export interface Criteria {
  from: string;
  to: string;
  adults: number;
  children: number;
}

export interface CurrentUser {
  id: string;
  email: string;
}

export interface ApiErrorShape {
  status: number;
  code: string;
  details: Record<string, unknown>;
}

/**
 * Trois états indépendants (`loading`, `data`, `error`) autorisent huit
 * combinaisons, dont quatre absurdes — et une ambiguë : `loading: false,
 * data: []` veut dire "aucun résultat" OU "pas encore chargé".
 *
 * Une union discriminée rend ces états non pas "déconseillés" mais
 * IMPOSSIBLES À ÉCRIRE.
 *
 * `previous` règle le clignotement : on affiche l'ancienne liste grisée
 * pendant le rechargement. Un booléen `loading` ne permet même pas
 * d'exprimer ce besoin.
 */
export type Loader<T> =
  | { state: "idle" }
  | { state: "loading"; previous: T | null }
  | { state: "loaded"; value: T }
  | { state: "failed"; error: ApiErrorShape };

export type LoaderAction<T> =
  | { type: "started" }
  | { type: "succeeded"; value: T }
  | { type: "failed"; error: ApiErrorShape };

/** Un reducer est une commande : pure, synchrone, testable sans React. */
export function loaderReducer<T>(
  state: Loader<T>,
  action: LoaderAction<T>
): Loader<T> {
  switch (action.type) {
    case "started":
      return {
        state: "loading",
        previous: state.state === "loaded" ? state.value : null,
      };
    case "succeeded":
      return { state: "loaded", value: action.value };
    case "failed":
      return { state: "failed", error: action.error };
    default: {
      // Ajoutez un cas à LoaderAction et le compilateur signalera
      // TOUS les switch incomplets de l'application.
      const impossible: never = action;
      throw new Error(`Unhandled action ${JSON.stringify(impossible)}`);
    }
  }
}
