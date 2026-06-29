import { beforeEach, describe, expect, it, vi } from "vitest";
import { PdfJsViewerAdapter } from "../src/pdfjs_viewer_adapter.js";
import type { PdfJsApplicationLike } from "../src/types.js";

describe("PdfJsViewerAdapter", () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it("scrolls focus rectangles with a DOM marker instead of a PDF XYZ destination", () => {
    const page = document.createElement("div");
    page.className = "page";
    document.body.append(page);
    const markerScrollIntoView = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation(tagName => {
      const element = originalCreateElement(tagName);
      if (tagName === "span") {
        element.scrollIntoView = markerScrollIntoView;
      }
      return element;
    });

    const scrollPageIntoView = vi.fn();
    const app: PdfJsApplicationLike = {
      pdfViewer: {
        currentPageNumber: 1,
        getPageView: () => ({ id: 1, div: page }),
        scrollPageIntoView,
      },
    };

    const adapter = new PdfJsViewerAdapter(app);
    adapter.scrollToPageRect(0, { x: 10, y: 50, width: 80, height: 12 });

    expect(scrollPageIntoView).not.toHaveBeenCalled();
    expect(markerScrollIntoView).toHaveBeenCalledWith({ block: "center", inline: "nearest" });
    expect(page.querySelector("span")).toBeNull();
  });
});
