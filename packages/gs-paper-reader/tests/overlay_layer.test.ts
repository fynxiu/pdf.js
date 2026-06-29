import { beforeEach, describe, expect, it } from "vitest";
import { OverlayLayerManager } from "../src/overlay_layer.js";
import { createMockPage, MockViewerAdapter } from "../src/testing/index.js";

describe("OverlayLayerManager", () => {
  let viewer: MockViewerAdapter;

  beforeEach(() => {
    document.body.replaceChildren();
    viewer = new MockViewerAdapter();
    viewer.pages.set(0, createMockPage(0));
  });

  it("renders page-local overlay rectangles", () => {
    const manager = new OverlayLayerManager(viewer);

    const nodes = manager.render({
      pageIndex: 0,
      kind: "reading-focus",
      rects: [{ left: 10, top: 20, width: 100, height: 12 }],
      dataset: { sentenceId: "p1:s1" },
    });

    expect(nodes).toHaveLength(1);
    expect(nodes[0]?.dataset.overlayKind).toBe("reading-focus");
    expect(nodes[0]?.dataset.sentenceId).toBe("p1:s1");
    expect(nodes[0]?.style.left).toBe("10px");
  });

  it("clears overlays by page and kind", () => {
    const manager = new OverlayLayerManager(viewer);
    manager.render({ pageIndex: 0, kind: "reading-focus", rects: [{ left: 1, top: 1, width: 1, height: 1 }] });
    manager.render({ pageIndex: 0, kind: "hover", rects: [{ left: 2, top: 2, width: 2, height: 2 }] });

    manager.clear(0, "reading-focus");

    expect(document.querySelectorAll("[data-overlay-kind='reading-focus']")).toHaveLength(0);
    expect(document.querySelectorAll("[data-overlay-kind='hover']")).toHaveLength(1);
  });
});
