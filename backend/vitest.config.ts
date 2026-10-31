import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 20000,
    hookTimeout: 20000,
    env: {
      JWT_SECRET: "segredo-somente-para-testes",
      DATABASE_FILE: ":memory:",
      NODE_ENV: "test"
    }
  }
});
