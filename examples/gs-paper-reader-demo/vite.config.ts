import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  server: { fs: { allow: [workspaceRoot] } },
  test: { environment: "happy-dom", include: ["tests/**/*.test.ts"] },
});
