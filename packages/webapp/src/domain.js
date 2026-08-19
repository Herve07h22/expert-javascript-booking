import { App, testDependencies, subscribers } from "@booking/core";

// Une seule instance, initialisée dans le module.
// Surtout pas dans un loader ou une action : les dépendances seraient
// réinitialisées à chaque appel, et l'état reviendrait à l'état initial.
export const app = new App(testDependencies(), subscribers);
