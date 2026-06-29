import { buildTextNodeMap, getPageLocalRectsFromRange, getTextContext } from "./dom_text_range.js";
import type {
  PageHandle,
  PdfJsApplicationLike,
  PdfRect,
  PdfScaleValue,
  PdfTextSelection,
  ViewerAdapter,
  VisiblePageRef,
} from "./types.js";

interface InternalPageViewLike {
  id?: number;
  div?: HTMLElement;
  textLayer?: { div?: HTMLElement | null } | null;
  viewport?: unknown;
}

interface InternalViewerLike extends PdfJsApplicationLike["pdfViewer"] {
  _getVisiblePages?: () => { views?: Array<{ id: number; percent?: number }> };
}

export class PdfJsViewerAdapter implements ViewerAdapter {
  readonly app: PdfJsApplicationLike;

  constructor(app: PdfJsApplicationLike) {
    this.app = app;
  }

  getCurrentPage(): number {
    return this.app.pdfViewer.currentPageNumber;
  }

  getPageCount(): number | null {
    return this.app.pdfViewer.pagesCount ?? null;
  }

  goToPage(pageNumber: number): void {
    const pageCount = this.getPageCount();
    const nextPage = pageCount ? Math.max(1, Math.min(pageNumber, pageCount)) : Math.max(1, pageNumber);
    this.app.pdfViewer.currentPageNumber = nextPage;
  }

  previousPage(): void {
    this.goToPage(this.getCurrentPage() - 1);
  }

  nextPage(): void {
    this.goToPage(this.getCurrentPage() + 1);
  }

  getScale(): PdfScaleValue | null {
    return this.app.pdfViewer.currentScaleValue ?? this.app.pdfViewer.currentScale ?? null;
  }

  setScale(scale: PdfScaleValue): void {
    if (typeof scale === "number") {
      this.app.pdfViewer.currentScale = scale;
      return;
    }
    this.app.pdfViewer.currentScaleValue = scale;
  }

  zoomIn(): void {
    this.app.eventBus?.dispatch("zoomin", { source: this });
  }

  zoomOut(): void {
    this.app.eventBus?.dispatch("zoomout", { source: this });
  }

  getPageHandle(pageIndex: number): PageHandle | null {
    const rawPageView = this.app.pdfViewer.getPageView?.(pageIndex) as InternalPageViewLike | null | undefined;
    if (!rawPageView?.div) {
      return null;
    }
    const pageHandle: PageHandle = {
      pageIndex,
      pageNumber: rawPageView.id ?? pageIndex + 1,
      div: rawPageView.div,
      textLayerDiv: rawPageView.textLayer?.div ?? rawPageView.div.querySelector<HTMLElement>(".textLayer"),
    };
    if (rawPageView.viewport) {
      pageHandle.viewport = rawPageView.viewport;
    }
    return pageHandle;
  }

  getVisiblePages(): VisiblePageRef[] {
    const viewer = this.app.pdfViewer as InternalViewerLike;
    const visible = viewer._getVisiblePages?.();
    if (!visible?.views?.length) {
      return [{ pageIndex: Math.max(0, this.getCurrentPage() - 1), pageNumber: this.getCurrentPage() }];
    }
    return visible.views.map(view => {
      const result: VisiblePageRef = {
        pageIndex: view.id - 1,
        pageNumber: view.id,
      };
      if (typeof view.percent === "number") {
        result.percentVisible = view.percent;
      }
      return result;
    });
  }

  getSelection(): PdfTextSelection | null {
    const selection = document.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return null;
    }

    const range = selection.getRangeAt(0);
    const textLayer = this.findTextLayerForRange(range);
    if (!textLayer) {
      return null;
    }
    const pageDiv = textLayer.closest<HTMLElement>(".page");
    if (!pageDiv) {
      return null;
    }

    const pageIndex = Math.max(0, Number(pageDiv.dataset.pageNumber ?? "1") - 1);
    const textMap = buildTextNodeMap(textLayer);
    const selectedText = selection.toString();
    const startOffset = this.getOffsetWithin(textLayer, range.startContainer, range.startOffset);
    const endOffset = this.getOffsetWithin(textLayer, range.endContainer, range.endOffset);
    if (startOffset === null || endOffset === null) {
      return null;
    }

    const start = Math.max(0, Math.min(startOffset, endOffset));
    const end = Math.max(start, Math.max(startOffset, endOffset));
    const { textBefore, textAfter } = getTextContext(textMap.text, start, end);
    const rects = getPageLocalRectsFromRange(range, pageDiv).map(rect => ({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    }));

    return {
      pageIndex,
      startOffset: start,
      endOffset: end,
      text: selectedText,
      textBefore,
      textAfter,
      rects,
    };
  }

  clearSelection(): void {
    document.getSelection()?.removeAllRanges();
  }

  scrollToPageRect(pageIndex: number, rect: PdfRect): void {
    this.app.pdfViewer.scrollPageIntoView?.({
      pageNumber: pageIndex + 1,
      destArray: [null, { name: "XYZ" }, rect.x, rect.y, null],
      allowNegativeOffset: true,
    });
  }

  private findTextLayerForRange(range: Range): HTMLElement | null {
    const candidates = [range.startContainer, range.endContainer];
    for (const candidate of candidates) {
      const element = candidate.nodeType === Node.ELEMENT_NODE ? (candidate as Element) : candidate.parentElement;
      const textLayer = element?.closest<HTMLElement>(".textLayer");
      if (textLayer) {
        return textLayer;
      }
    }
    return null;
  }

  private getOffsetWithin(root: HTMLElement, container: Node, offset: number): number | null {
    if (!root.contains(container)) {
      return null;
    }
    const range = document.createRange();
    range.selectNodeContents(root);
    try {
      range.setEnd(container, offset);
      return range.toString().length;
    } catch {
      return null;
    } finally {
      range.detach();
    }
  }
}

export function createPdfJsViewerAdapter(app: PdfJsApplicationLike = window.PDFViewerApplication as PdfJsApplicationLike): PdfJsViewerAdapter {
  return new PdfJsViewerAdapter(app);
}

declare global {
  interface Window {
    PDFViewerApplication?: PdfJsApplicationLike;
  }
}
