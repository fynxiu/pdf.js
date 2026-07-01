import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const styles = readFileSync(resolve("src/styles.css"), "utf8");

describe("PDF text selection layering", () => {
  it("keeps saved highlight overlays below the text layer selection paint", () => {
    document.head.innerHTML = `<style>${styles}</style>`;
    document.body.innerHTML = `
      <section class="page demo-pdf-page">
        <canvas class="demo-pdf-canvas"></canvas>
        <div class="textLayer demo-text-layer"></div>
        <div class="gspr-overlay-layer"></div>
      </section>
    `;

    const textLayer = document.querySelector<HTMLElement>(".demo-text-layer")!;
    const overlayLayer = document.querySelector<HTMLElement>(".gspr-overlay-layer")!;

    const textLayerZIndex = Number(getComputedStyle(textLayer).zIndex);
    const overlayLayerZIndex = Number(getComputedStyle(overlayLayer).zIndex);

    expect(overlayLayerZIndex).toBeLessThan(textLayerZIndex);
  });

  it("hides saved annotation highlights while text is actively selected", () => {
    document.head.innerHTML = `<style>${styles}</style>`;
    document.body.innerHTML = `
      <div class="demo-shell has-selection">
        <section class="page demo-pdf-page">
          <div class="gspr-overlay-layer">
            <div class="gspr-overlay-rect gspr-overlay-annotation"></div>
          </div>
        </section>
      </div>
    `;

    const annotation = document.querySelector<HTMLElement>(".gspr-overlay-annotation")!;

    expect(getComputedStyle(annotation).visibility).toBe("hidden");
  });

  it("uses the demo selection overlay instead of native text-layer selection paint", () => {
    expect(styles).toContain(".demo-text-layer ::selection { background: transparent; }");
    expect(styles).toContain(".demo-active-selection-layer");
    expect(styles).toContain(".demo-active-selection-rect");
  });

  it("applies PDF.js text-layer span scale variables for accurate selection geometry", () => {
    expect(styles).toContain("--text-scale-factor: var(--total-scale-factor, 1)");
    expect(styles).toContain("font-size: calc(var(--text-scale-factor) * var(--font-height))");
    expect(styles).toContain("scaleX(var(--scale-x))");
  });
});
