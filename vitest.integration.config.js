import { defineConfig } from "vitest/config";

// La suite lente : les mêmes contrats, contre une vraie base de données.
// TEST_DATABASE_URL=postgres://... yarn test:integration
export default defineConfig({
  test: {
    include: ["**/*.integration.test.js"],
    exclude: ["**/node_modules/**", "**/dist/**"],
  },
});
