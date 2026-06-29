import type {
  PageHandle,
  PdfRect,
  PdfScaleValue,
  PdfTextSelection,
  ViewerAdapter,
  VisiblePageRef,
} from "../types.js";

export class MockViewerAdapter implements ViewerAdapter {
  currentPage = 1;
  pageCount: number | null = null;
  scale: PdfScaleValue | null = "page-width";
  selection: PdfTextSelection | null = null;
  readonly pages = new Map<number, PageHandle>();
  readonly scrollCalls: Array<{ pageIndex: number; rect: PdfRect }> = [];
  zoomInCalls = 0;
  zoomOutCalls = 0;

  getCurrentPage(): number {
    return this.currentPage;
  }

  getPageCount(): number | null {
    return this.pageCount;
  }

  goToPage(pageNumber: number): void {
    this.currentPage = pageNumber;
  }

  previousPage(): void {
    this.currentPage -= 1;
  }

  nextPage(): void {
    this.currentPage += 1;
  }

  getScale(): PdfScaleValue | null {
    return this.scale;
  }

  setScale(scale: PdfScaleValue): void {
    this.scale = scale;
  }

  zoomIn(): void {
    this.zoomInCalls += 1;
  }

  zoomOut(): void {
    this.zoomOutCalls += 1;
  }

  getPageHandle(pageIndex: number): PageHandle | null {
    return this.pages.get(pageIndex) ?? null;
  }

  getVisiblePages(): VisiblePageRef[] {
    return Array.from(this.pages.values()).map(page => ({
      pageIndex: page.pageIndex,
      pageNumber: page.pageNumber,
    }));
  }

  getSelection(): PdfTextSelection | null {
    return this.selection;
  }

  clearSelection(): void {
    this.selection = null;
  }

  scrollToPageRect(pageIndex: number, rect: PdfRect): void {
    this.scrollCalls.push({ pageIndex, rect });
  }
}

export function createMockPage(pageIndex: number, text = ""): PageHandle {
  const pageDiv = document.createElement("div");
  pageDiv.className = "page";
  pageDiv.dataset.pageNumber = String(pageIndex + 1);
  Object.assign(pageDiv.style, {
    position: "relative",
    width: "600px",
    height: "800px",
  });

  const textLayerDiv = document.createElement("div");
  textLayerDiv.className = "textLayer";
  textLayerDiv.textContent = text;
  pageDiv.append(textLayerDiv);
  document.body.append(pageDiv);

  return {
    pageIndex,
    pageNumber: pageIndex + 1,
    div: pageDiv,
    textLayerDiv,
  };
}
