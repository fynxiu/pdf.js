# @gs/paper-reader

`@gs/paper-reader` is a research-oriented PDF.js viewer extension package for paper reading, sentence-level focus, transient overlays, review annotations, evidence cards, extraction workflows, and AI-assisted reading.

The package is intentionally designed as a layer above the current PDF.js viewer. PDF.js remains responsible for rendering pages, text layers, native annotation layers, navigation, zooming, and search infrastructure. This package owns research workflow state and UI primitives.

## Design goals

1. Keep PDF.js upgradeable by isolating integration code behind `ViewerAdapter`.
2. Treat reading focus, hover state, AI suggestions, and search previews as transient overlays, not persistent annotations.
3. Treat highlights, notes, evidence cards, extraction values, and review decisions as persistent research data.
4. Make all core features testable without a real PDF document.
5. Provide API and AI-friendly documentation so humans and coding agents can extend the viewer safely.

## Package layout

```text
packages/gs-paper-reader
├── src
│   ├── annotation_store.ts        # AnnotationStore contract + in-memory implementation
│   ├── command_registry.ts        # Command palette and keyboard-command primitives
│   ├── dom_text_range.ts          # DOM text offset and Range helpers
│   ├── evidence.ts                # Evidence card creation from confirmed annotations
│   ├── overlay_layer.ts           # Transient overlay layer manager
│   ├── paper_reader.ts            # High-level composition entry point
│   ├── pdfjs_viewer_adapter.ts    # Adapter over PDFViewerApplication
│   ├── reading_focus.ts           # Sentence Focus Mode controller
│   ├── sentence_segmenter.ts      # Sentence segmentation and sentence index
│   ├── styles.css                 # Overlay styles
│   ├── testing/index.ts           # Mock viewer utilities for TDD
│   └── types.ts                   # Public API types
├── tests                          # Vitest TDD coverage
└── docs                           # Architecture, API, TDD, and AI-agent docs
```

## Quick start

```ts
import {
  buildSentenceIndex,
  createPaperReader,
  OverlayLayerManager,
  SentenceFocusController,
} from "@gs/paper-reader";
import "@gs/paper-reader/styles.css";

const reader = createPaperReader({
  app: window.PDFViewerApplication,
});

reader.viewer.setScale("page-width");
reader.commands.run("viewer.nextPage", { viewer: reader.viewer });
```

## Sentence Focus Mode

Sentence Focus Mode keeps a single current sentence visually highlighted while the reader moves sentence by sentence.

```ts
const sentenceIndex = buildSentenceIndex([
  { pageIndex: 0, text: "First sentence. Second sentence." },
]);

const reader = createPaperReader({
  app: window.PDFViewerApplication,
  sentenceIndex,
});

reader.sentenceFocus.enable();
reader.sentenceFocus.move(1); // next sentence
reader.sentenceFocus.move(-1); // previous sentence
reader.sentenceFocus.disable();
```

Default keyboard behavior provided by `SentenceFocusController.bindKeyboard()`:

```text
ArrowDown / j / Space -> next sentence
ArrowUp / k           -> previous sentence
Escape                -> leave focus mode
```

## Transient overlay model

Do not mutate PDF.js search highlight DOM or native annotation editor DOM for research-specific overlays. Instead, render rectangles into a dedicated overlay layer.

```ts
reader.overlays.render({
  pageIndex: 0,
  kind: "ai-suggestion",
  rects: [{ left: 100, top: 200, width: 240, height: 18 }],
});

reader.overlays.clear(undefined, "ai-suggestion");
```

Overlay kinds:

```ts
"reading-focus" | "search-preview" | "annotation" | "ai-suggestion" | "hover"
```

## Annotation and evidence model

Reading focus is temporary. A persistent annotation is created only after an explicit user action.

```ts
const annotation = await reader.annotations.create({
  paperId: "paper-1",
  type: "evidence",
  pageIndex: 3,
  rectsPdfSpace: [{ x: 80, y: 120, width: 300, height: 24 }],
  text: "The intervention improved the primary outcome.",
  linkedReviewQuestionId: "rq-1",
});

const evidence = reader.evidence.fromAnnotation({
  annotation,
  evidenceType: "result",
  confidence: "high",
});
```

## TDD workflow

```bash
cd packages/gs-paper-reader
npm install
npm test
npm run typecheck
npm run build
```

Every new feature should start with one of these test categories:

1. Pure logic tests: sentence segmentation, evidence conversion, command enabling.
2. DOM tests: overlay creation, text range mapping, selection mapping.
3. Adapter tests: PDF.js integration behavior through mocks.
4. Workflow tests: selection -> annotation -> evidence -> extraction.

## Current implementation status

Implemented in this package scaffold:

- Public domain types for viewer, annotation, evidence, extraction, AI provenance, and commands.
- PDF.js viewer adapter.
- Transient overlay manager.
- Sentence segmentation and sentence index.
- Sentence focus controller.
- Annotation store contract and in-memory implementation.
- Evidence card service.
- Command registry and default commands.
- Testing utilities and initial Vitest tests.
- Human and AI-oriented documentation.

Planned next steps:

- Production annotation persistence adapter.
- PDF coordinate conversion through PDF.js viewport APIs.
- Enhanced section/figure/table indexing.
- Extraction Mode UI contracts.
- AI suggestion review and confirmation pipeline.
- Reference/citation linking.
