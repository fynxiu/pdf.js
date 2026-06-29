# API Reference

This document describes the stable public surface of `@gs/paper-reader`.

## Entry points

```ts
import {
  createPaperReader,
  createPdfJsViewerAdapter,
  OverlayLayerManager,
  SentenceFocusController,
  InMemoryAnnotationStore,
  EvidenceService,
  CommandRegistry,
  buildSentenceIndex,
} from "@gs/paper-reader";
```

## `createPaperReader(options)`

Creates a high-level reader object composed from viewer, overlay, focus, annotation, evidence, and command modules.

```ts
const reader = createPaperReader({
  app: window.PDFViewerApplication,
  sentenceIndex,
  annotationStore,
});
```

Options:

```ts
interface PaperReaderOptions {
  app?: PdfJsApplicationLike;
  viewer?: ViewerAdapter;
  sentenceIndex?: SentenceIndex;
  annotationStore?: AnnotationStore;
  registerDefaultCommands?: boolean;
}
```

Returned object:

```ts
class PaperReader {
  viewer: ViewerAdapter;
  overlays: OverlayLayerManager;
  sentenceFocus: SentenceFocusController;
  annotations: AnnotationStore;
  evidence: EvidenceService;
  commands: CommandRegistry;
}
```

## `ViewerAdapter`

Stable viewer integration contract.

```ts
interface ViewerAdapter {
  getCurrentPage(): number;
  getPageCount(): number | null;
  goToPage(pageNumber: number): void;
  previousPage(): void;
  nextPage(): void;
  getScale(): PdfScaleValue | null;
  setScale(scale: PdfScaleValue): void;
  zoomIn(): void;
  zoomOut(): void;
  getPageHandle(pageIndex: number): PageHandle | null;
  getVisiblePages(): VisiblePageRef[];
  getSelection(): PdfTextSelection | null;
  clearSelection(): void;
  scrollToPageRect(pageIndex: number, rect: PdfRect): void;
}
```

Use `createPdfJsViewerAdapter(window.PDFViewerApplication)` to wrap PDF.js.

## `OverlayLayerManager`

Creates page-local overlay rectangles.

```ts
const overlays = new OverlayLayerManager(viewer);

overlays.render({
  pageIndex: 0,
  kind: "reading-focus",
  rects: [{ left: 80, top: 200, width: 320, height: 18 }],
});

overlays.clear(0, "reading-focus");
overlays.clear(undefined, "ai-suggestion");
```

Overlay kinds:

```ts
type OverlayKind =
  | "reading-focus"
  | "search-preview"
  | "annotation"
  | "ai-suggestion"
  | "hover";
```

## `buildSentenceIndex(pages, locale)`

Builds an ordered sentence index from page text.

```ts
const sentenceIndex = buildSentenceIndex([
  { pageIndex: 0, text: "First sentence. Second sentence." },
  { pageIndex: 1, text: "Third sentence." },
]);
```

`SentenceIndex` supports:

```ts
interface SentenceIndex {
  sentences: readonly SentenceRef[];
  getById(id: string): SentenceRef | null;
  getRelative(id: string | null, delta: -1 | 1): SentenceRef | null;
  getFirstOnPage(pageIndex: number): SentenceRef | null;
}
```

## `SentenceFocusController`

Controls current-sentence reading focus.

```ts
const focus = new SentenceFocusController({
  viewer,
  overlays,
  sentenceIndex,
});

focus.enable();
focus.move(1);
focus.move(-1);
focus.disable();

const unbind = focus.bindKeyboard(document);
```

Keyboard defaults:

```text
ArrowDown / j / Space -> next sentence
ArrowUp / k           -> previous sentence
Escape                -> disable focus
```

## `AnnotationStore`

Persistence contract for review annotations.

```ts
interface AnnotationStore {
  create(input: NewReviewAnnotation): Promise<ReviewAnnotation>;
  update(id: string, patch: Partial<Omit<ReviewAnnotation, "id" | "createdAt">>): Promise<ReviewAnnotation>;
  delete(id: string): Promise<void>;
  listByPaper(paperId: string): Promise<ReviewAnnotation[]>;
  get(id: string): Promise<ReviewAnnotation | null>;
}
```

Production applications should provide their own implementation.

## `EvidenceService`

Converts a confirmed annotation into an evidence card.

```ts
const evidence = reader.evidence.fromAnnotation({
  annotation,
  evidenceType: "result",
  confidence: "high",
});
```

Evidence is intentionally tied to an annotation id so every evidence card has provenance.

## `CommandRegistry`

Command-palette and keyboard-command primitive.

```ts
const registry = new CommandRegistry();
registry.register({
  id: "selection.saveAsEvidence",
  title: "Save selected text as evidence",
  isEnabled: context => Boolean(context.selection?.text),
  run: async context => {
    // application-specific save logic
  },
});

await registry.run("selection.saveAsEvidence", {
  viewer,
  selection: viewer.getSelection(),
});
```

Default commands:

```text
viewer.previousPage
viewer.nextPage
viewer.zoomIn
viewer.zoomOut
selection.copyWithCitation
```

## Testing utilities

```ts
import { MockViewerAdapter, createMockPage } from "@gs/paper-reader/testing";

const viewer = new MockViewerAdapter();
viewer.pages.set(0, createMockPage(0, "Some page text."));
```
