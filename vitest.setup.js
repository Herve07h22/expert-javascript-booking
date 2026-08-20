import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Sans `globals: true`, Testing Library n'enregistre pas son nettoyage
// automatique : le DOM du test précédent resterait monté, et le suivant
// trouverait deux boutons "Se connecter".
afterEach(cleanup);
