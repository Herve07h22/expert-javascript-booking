import { it, expect, describe } from "vitest";
import { loaderReducer } from "../src/types.js";
import type { Loader } from "../src/types.js";

/**
 * Un reducer est une commande : pure et synchrone (chapitre 7).
 * Il se teste sans React, sans navigateur, sans rien monter.
 */
describe("loaderReducer", () => {
  const idle: Loader<number[]> = { state: "idle" };
  const loaded: Loader<number[]> = { state: "loaded", value: [1, 2] };
  const error = { status: 0, code: "NETWORK_ERROR", details: {} };

  it("passe de idle à loading sans valeur précédente", () => {
    expect(loaderReducer(idle, { type: "started" })).toEqual({
      state: "loading",
      previous: null,
    });
  });

  it("garde la liste précédente pendant un rechargement", () => {
    // C'est ce qui évite le clignotement : sans ce champ, on ne pourrait
    // même pas exprimer le besoin.
    expect(loaderReducer(loaded, { type: "started" })).toEqual({
      state: "loading",
      previous: [1, 2],
    });
  });

  it("oublie la valeur précédente après un échec", () => {
    const failed = loaderReducer(loaded, { type: "failed", error });
    expect(loaderReducer(failed, { type: "started" })).toEqual({
      state: "loading",
      previous: null,
    });
  });

  it("ne peut pas être en échec ET porter une valeur", () => {
    const failed = loaderReducer(loaded, { type: "failed", error });
    expect(failed).toEqual({ state: "failed", error });
    expect("value" in failed).toBe(false);
  });
});
