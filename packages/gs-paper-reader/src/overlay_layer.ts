import type { OverlayKind, OverlayRectInput, PageHandle } from "./types.js";

const LAYER_CLASS = "gspr-overlay-layer";
const RECT_CLASS = "gspr-overlay-rect";

export interface OverlayPageResolver {
  getPageHandle(pageIndex: number): PageHandle | null;
}

export class OverlayLayerManager {
  private readonly resolver: OverlayPageResolver;

  constructor(resolver: OverlayPageResolver) {
    this.resolver = resolver;
  }

  render(input: OverlayRectInput): HTMLElement[] {
    const page = this.resolver.getPageHandle(input.pageIndex);
    if (!page) {
      return [];
    }

    const layer = this.ensureLayer(page.div);
    this.clear(input.pageIndex, input.kind);

    return input.rects.map(rect => {
      const el = page.div.ownerDocument.createElement("div");
      el.className = [RECT_CLASS, `gspr-overlay-${input.kind}`, input.className].filter(Boolean).join(" ");
      el.dataset.overlayKind = input.kind;
      for (const [key, value] of Object.entries(input.dataset ?? {})) {
        el.dataset[key] = value;
      }
      Object.assign(el.style, {
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      });
      layer.append(el);
      return el;
    });
  }

  clear(pageIndex?: number, kind?: OverlayKind): void {
    const selector = kind ? `[data-overlay-kind="${kind}"]` : `.${RECT_CLASS}`;

    if (typeof pageIndex === "number") {
      const page = this.resolver.getPageHandle(pageIndex);
      page?.div.querySelectorAll(selector).forEach(node => node.remove());
      return;
    }

    document.querySelectorAll(`.${LAYER_CLASS} ${selector}`).forEach(node => node.remove());
  }

  ensureLayer(pageDiv: HTMLElement): HTMLElement {
    const existing = pageDiv.querySelector<HTMLElement>(`:scope > .${LAYER_CLASS}`);
    if (existing) {
      return existing;
    }

    const layer = pageDiv.ownerDocument.createElement("div");
    layer.className = LAYER_CLASS;
    layer.setAttribute("aria-hidden", "true");
    pageDiv.append(layer);
    return layer;
  }
}

export const overlayClassNames = {
  layer: LAYER_CLASS,
  rect: RECT_CLASS,
} as const;
