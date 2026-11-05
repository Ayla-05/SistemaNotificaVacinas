import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globalSetup: ["tests/_util/globalSetup.ts"],
    setupFiles: ["tests/_util/bancoDeTeste.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
    env: {
      JWT_SECRET: "segredo-somente-para-testes",
      NODE_ENV: "test"
    }
  }
});
