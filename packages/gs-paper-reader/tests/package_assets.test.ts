import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("package asset publishing", () => {
  it("copies the public stylesheet during build", () => {
    const packageJson = JSON.parse(readFileSync(resolve("package.json"), "utf8")) as {
      scripts: Record<string, string>;
      exports: Record<string, string>;
    };

    expect(packageJson.exports["./styles.css"]).toBe("./dist/styles.css");
    expect(packageJson.scripts.build).toContain("copy:assets");
    expect(packageJson.scripts["copy:assets"]).toContain("scripts/copy-assets.mjs");
    expect(existsSync(resolve("scripts/copy-assets.mjs"))).toBe(true);
  });

  it("uses a patched happy-dom test runtime", () => {
    const packageJson = JSON.parse(readFileSync(resolve("package.json"), "utf8")) as {
      devDependencies: Record<string, string>;
    };

    expect(packageJson.devDependencies["happy-dom"]).toBe("^20.10.6");
  });
});
