import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const assets = [["src/styles.css", "dist/styles.css"]];

for (const [source, target] of assets) {
  await mkdir(dirname(resolve(target)), { recursive: true });
  await copyFile(resolve(source), resolve(target));
}
