import { beforeEach, describe, expect, it, vi } from "vitest";
import { DemoPdfRenderer } from "../src/pdf_loader.js";

const pdfjsMock = vi.hoisted(() => {
  const pendingDocuments: Array<{ resolve: (pdf: unknown) => void; reject: (error: unknown) => void }> = [];
  const getDocument = vi.fn(() => {
    let resolve!: (pdf: unknown) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    pendingDocuments.push({ resolve, reject });
    return { promise };
  });

  return { getDocument, pendingDocuments };
});

vi.mock("pdfjs-dist", () => ({
  GlobalWorkerOptions: {},
  getDocument: pdfjsMock.getDocument,
  TextLayer: class {
    #container: HTMLElement;
    #textContentSource: { items: Array<Record<string, unknown>> };

    constructor(params: { container: HTMLElement; textContentSource: { items: Array<Record<string, unknown>> } }) {
      this.#container = params.container;
      this.#textContentSource = params.textContentSource;
    }

    async render(): Promise<void> {
      for (const item of this.#textContentSource.items) {
        const span = this.#container.ownerDocument.createElement("span");
        span.textContent = String(item.str ?? "");
        this.#container.append(span);
      }
    }
  },
}));

vi.mock("pdfjs-dist/build/pdf.worker.mjs?url", () => ({ default: "pdf.worker.mjs" }));

function createPdf(text: string) {
  return {
    numPages: 1,
    async getPage() {
      return {
        getViewport: () => ({
          width: 100,
          height: 120,
          convertToPdfPoint: (x: number, y: number) => [x, y],
          convertToViewportPoint: (x: number, y: number) => [x, y],
        }),
        render: () => ({ promise: Promise.resolve() }),
        getTextContent: async () => ({ items: [{ str: text }] }),
      };
    },
  };
}

function createViewer() {
  return {
    clearPages: vi.fn(),
    setPageCount: vi.fn(),
    registerPage: vi.fn(),
  };
}

describe("DemoPdfRenderer", () => {
  beforeEach(() => {
    document.body.replaceChildren();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({} as CanvasRenderingContext2D);
    pdfjsMock.pendingDocuments.length = 0;
    pdfjsMock.getDocument.mockClear();
  });

  it("cancels stale PDF loads when a newer import starts", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    const viewer = createViewer();
    const renderer = new DemoPdfRenderer(container, viewer as never);

    const firstLoad = renderer.load(new Uint8Array([1]), "first.pdf");
    const secondLoad = renderer.load(new Uint8Array([2]), "second.pdf");

    pdfjsMock.pendingDocuments[1]!.resolve(createPdf("second page"));
    await expect(secondLoad).resolves.toMatchObject({
      title: "second.pdf",
      pageCount: 1,
    });

    pdfjsMock.pendingDocuments[0]!.resolve(createPdf("first page"));
    await expect(firstLoad).resolves.toBeNull();

    expect(container.querySelectorAll(".demo-pdf-page")).toHaveLength(1);
    expect(container.textContent).toContain("second page");
    expect(container.textContent).not.toContain("first page");
    expect(viewer.registerPage).toHaveBeenCalledTimes(1);
  });
});
