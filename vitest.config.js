import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// La suite rapide : le domaine, les contrats en mémoire, l'API et les
// composants. Quelques centaines de millisecondes.
// Une suite lente est une suite qu'on cesse de lancer.
export default defineConfig({
  plugins: [react()],
  test: {
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/e2e/**",
      "**/*.integration.test.?(c|m)[jt]s",
    ],
    // Seuls les composants ont besoin d'un DOM : le domaine tourne à vide.
    environmentMatchGlobs: [["packages/webapp/**", "jsdom"]],
    setupFiles: ["./vitest.setup.js"],
  },
});
