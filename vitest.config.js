import { defineConfig } from "vitest/config";

// La suite rapide : le domaine et les contrats en mémoire, quelques millisecondes.
// Une suite lente est une suite qu'on cesse de lancer.
export default defineConfig({
  test: {
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/*.integration.test.?(c|m)[jt]s",
    ],
  },
});
