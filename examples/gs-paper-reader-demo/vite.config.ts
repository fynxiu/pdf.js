import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));
const packageEntry = fileURLToPath(
  new URL("../../packages/gs-paper-reader/src/index.ts", import.meta.url)
);
const packageStyles = fileURLToPath(
  new URL("../../packages/gs-paper-reader/src/styles.css", import.meta.url)
);

export default defineConfig({
  resolve: {
    alias: [
      { find: "@gs/paper-reader/styles.css", replacement: packageStyles },
      { find: "@gs/paper-reader", replacement: packageEntry },
    ],
  },
  server: { fs: { allow: [workspaceRoot] } },
  test: { environment: "happy-dom", include: ["tests/**/*.test.ts"] },
});
