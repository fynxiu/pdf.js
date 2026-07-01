import { overlayClassNames, type PageLocalRect } from "@gs/paper-reader";
import type { DemoViewerAdapter } from "./demo_viewer_adapter.js";

const LAYER_CLASS = "demo-active-selection-layer";
const RECT_CLASS = "demo-active-selection-rect";

interface ActiveSelectionOverlayInput {
  viewer: Pick<DemoViewerAdapter, "getPageHandle">;
  pageIndex: number;
  rects: readonly PageLocalRect[];
}

export function renderActiveSelectionOverlay({ viewer, pageIndex, rects }: ActiveSelectionOverlayInput): void {
  clearActiveSelectionOverlay();
  const page = viewer.getPageHandle(pageIndex);
  if (!page) return;

  const layer = page.div.ownerDocument.createElement("div");
  layer.className = LAYER_CLASS;
  layer.setAttribute("aria-hidden", "true");
  page.div.append(layer);

  for (const rect of rects.filter(isRenderableRect)) {
    const el = page.div.ownerDocument.createElement("div");
    el.className = `${overlayClassNames.rect} ${RECT_CLASS}`;
    Object.assign(el.style, {
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
    layer.append(el);
  }
}

export function clearActiveSelectionOverlay(root: ParentNode = document): void {
  root.querySelectorAll(`.${LAYER_CLASS}`).forEach(layer => layer.remove());
}

function isRenderableRect(rect: PageLocalRect): boolean {
  return [rect.left, rect.top, rect.width, rect.height].every(Number.isFinite) && rect.width > 0 && rect.height > 0;
}
