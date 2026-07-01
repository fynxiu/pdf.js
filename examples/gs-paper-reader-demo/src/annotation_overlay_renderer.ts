import { overlayClassNames, type PageLocalRect, type ReviewAnnotation } from "@gs/paper-reader";
import type { DemoViewerAdapter } from "./demo_viewer_adapter.js";

export interface AnnotationOverlayRecord {
  annotation: ReviewAnnotation;
  pageLocalRects: PageLocalRect[];
}

export interface AnnotationOverlayRendererInput {
  reader: {
    overlays: {
      clear(pageIndex?: number, kind?: "annotation"): void;
      ensureLayer(pageDiv: HTMLElement): HTMLElement;
    };
  };
  viewer: Pick<DemoViewerAdapter, "getPageHandle" | "pdfRectToPageLocalRect">;
  annotations: readonly AnnotationOverlayRecord[];
}

export function renderAnnotationOverlayRecords({ reader, viewer, annotations }: AnnotationOverlayRendererInput): void {
  reader.overlays.clear(undefined, "annotation");

  for (const record of annotations) {
    const page = viewer.getPageHandle(record.annotation.pageIndex);
    if (!page) continue;

    const rects = record.annotation.rectsPdfSpace
      .map(rect => viewer.pdfRectToPageLocalRect(page, rect))
      .filter(isRenderableRect);
    const renderRects = rects.length ? rects : record.pageLocalRects.filter(isRenderableRect);
    if (renderRects.length === 0) continue;

    const layer = reader.overlays.ensureLayer(page.div);
    for (const rect of renderRects) {
      const el = page.div.ownerDocument.createElement("div");
      el.className = `${overlayClassNames.rect} gspr-overlay-annotation`;
      el.dataset.overlayKind = "annotation";
      el.dataset.annotationId = record.annotation.id;
      Object.assign(el.style, {
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      });
      layer.append(el);
    }
  }
}

function isRenderableRect(rect: PageLocalRect): boolean {
  return [rect.left, rect.top, rect.width, rect.height].every(Number.isFinite) && rect.width > 0 && rect.height > 0;
}
