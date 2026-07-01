import type { PageLocalRect, ReviewAnnotation } from "@gs/paper-reader";
import { describe, expect, it, vi } from "vitest";
import { renderAnnotationOverlayRecords, type AnnotationOverlayRendererInput } from "../src/annotation_overlay_renderer.js";

function createAnnotation(): ReviewAnnotation {
  return {
    id: "ann-1",
    paperId: "paper-1",
    type: "highlight",
    pageIndex: 0,
    rectsPdfSpace: [{ x: 10, y: 20, width: 30, height: 8 }],
    text: "Selected text",
    createdAt: "2026-07-01T00:00:00.000Z",
  };
}

describe("renderAnnotationOverlayRecords", () => {
  it("renders annotation overlays from the saved PDF-space selection rectangles", () => {
    document.body.replaceChildren();
    const pageDiv = document.createElement("div");
    const layer = document.createElement("div");
    pageDiv.append(layer);
    document.body.append(pageDiv);

    const projectedRect: PageLocalRect = { left: 12, top: 34, width: 56, height: 18 };
    const staleSelectionRect: PageLocalRect = { left: 400, top: 500, width: 160, height: 40 };
    const reader = {
      overlays: {
        clear: vi.fn(),
        ensureLayer: vi.fn(() => layer),
      },
    };
    const viewer = {
      getPageHandle: vi.fn(() => ({ pageIndex: 0, pageNumber: 1, div: pageDiv, textLayerDiv: null })),
      pdfRectToPageLocalRect: vi.fn(() => projectedRect),
    };

    const input: AnnotationOverlayRendererInput = {
      reader,
      viewer,
      annotations: [{ annotation: createAnnotation(), pageLocalRects: [staleSelectionRect] }],
    };

    renderAnnotationOverlayRecords(input);

    expect(reader.overlays.clear).toHaveBeenCalledWith(undefined, "annotation");
    expect(viewer.pdfRectToPageLocalRect).toHaveBeenCalledWith(expect.objectContaining({ pageIndex: 0 }), { x: 10, y: 20, width: 30, height: 8 });

    const overlay = layer.querySelector<HTMLElement>("[data-annotation-id='ann-1']");
    expect(overlay).not.toBeNull();
    expect(overlay?.style.left).toBe("12px");
    expect(overlay?.style.top).toBe("34px");
    expect(overlay?.style.width).toBe("56px");
    expect(overlay?.style.height).toBe("18px");
  });
});
