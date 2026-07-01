import { describe, expect, it } from "vitest";
import type { DemoPageHandle } from "../src/demo_viewer_adapter.js";
import { clearActiveSelectionOverlay, renderActiveSelectionOverlay } from "../src/active_selection_overlay_renderer.js";

function createViewer() {
  const pageDiv = document.createElement("section");
  const page: DemoPageHandle = { pageIndex: 0, pageNumber: 1, div: pageDiv, textLayerDiv: null };
  document.body.append(pageDiv);
  return {
    pageDiv,
    viewer: {
      getPageHandle: () => page,
    },
  };
}

describe("active selection overlay renderer", () => {
  it("renders and clears page-local active selection rectangles", () => {
    document.body.replaceChildren();
    const { pageDiv, viewer } = createViewer();

    renderActiveSelectionOverlay({
      viewer,
      pageIndex: 0,
      rects: [{ left: 11, top: 22, width: 33, height: 12 }],
    });

    const rect = pageDiv.querySelector<HTMLElement>(".demo-active-selection-rect");
    expect(rect).not.toBeNull();
    expect(rect?.style.left).toBe("11px");
    expect(rect?.style.top).toBe("22px");
    expect(rect?.style.width).toBe("33px");
    expect(rect?.style.height).toBe("12px");

    clearActiveSelectionOverlay();

    expect(pageDiv.querySelector(".demo-active-selection-layer")).toBeNull();
  });
});
