# Architecture

`@gs/paper-reader` is designed as an application-level package on top of PDF.js Viewer.

## Boundary with PDF.js

PDF.js owns:

- PDF loading and rendering.
- Canvas pages.
- Text layer.
- Native PDF annotation layer.
- Native links, forms, and page-level viewer behavior.
- Existing PDF.js find/navigation infrastructure.

`@gs/paper-reader` owns:

- Research annotations.
- Reading state.
- Sentence focus.
- Evidence cards.
- Extraction workflows.
- Command palette commands.
- AI suggestion previews and confirmation flow.
- Application-specific overlays.

This boundary keeps PDF.js upgradeable. Most PDF.js internals are accessed only through `ViewerAdapter`.

## Runtime layer model

Recommended per-page layer order:

```text
.page
  ├── canvasWrapper              # PDF.js page bitmap/canvas
  ├── textLayer                  # PDF.js selectable text
  ├── annotationLayer            # PDF.js links/forms/native annotations
  ├── gspr-overlay-layer         # @gs/paper-reader transient overlays
  ├── reviewAnnotationLayer      # host app persistent annotations, optional
  └── annotationEditorLayer      # PDF.js native editor layer, optional
```

The package currently provides `gspr-overlay-layer` for transient rectangles. The host application may use the same layer for previews or create a separate persistent annotation layer.

## State model

State is split into three categories.

### Transient overlay state

Examples:

- Current sentence focus.
- Hover preview.
- Current search preview.
- AI suggestion preview.

Storage: DOM only. It should disappear when mode changes, page rerenders, or the user exits the workflow.

### Session reading state

Examples:

- Current page.
- Current sentence.
- Current scale.
- Active reading mode.
- Open side panel.

Storage: host application session store or database table such as `paper_reading_state`.

### Persistent research data

Examples:

- Review annotations.
- Notes.
- Evidence cards.
- Extraction values.
- Include/exclude/maybe decisions.

Storage: host application persistence layer through implementations of `AnnotationStore` and future extraction/decision store contracts.

## Core modules

### `PdfJsViewerAdapter`

Provides a stable integration surface over `window.PDFViewerApplication`.

Use it for page navigation, scale changes, text selection, visible pages, page handles, and scroll targeting. Do not scatter direct references to `window.PDFViewerApplication` across feature code.

### `OverlayLayerManager`

Creates and clears page-local overlay rectangles.

Use it for transient overlays only. For persistent annotations, use the host app's annotation layer or a dedicated renderer backed by `AnnotationStore`.

### `SentenceFocusController`

Controls sentence-by-sentence reading focus.

It consumes a `SentenceIndex`, resolves page-local DOM rectangles, renders `reading-focus` overlays, and optionally scrolls the current sentence into view.

### `AnnotationStore`

Defines the persistence contract for review annotations.

The package includes `InMemoryAnnotationStore` for tests, demos, and local prototypes. Production applications should provide a store backed by their database or API.

### `EvidenceService`

Converts confirmed annotations into evidence cards.

This intentionally requires a confirmed annotation so evidence keeps provenance back to the exact selected quote.

### `CommandRegistry`

Provides a command-palette-friendly registry. Commands are context-aware and can be enabled or disabled based on selection, active annotation, or viewer state.

## Extension rules

1. Add new PDF.js integration only in an adapter or adapter-adjacent module.
2. Add workflow logic in package modules, not in patched PDF.js viewer files.
3. Store persistent data through explicit store contracts.
4. Render temporary UI through overlay managers.
5. Write tests before adding or changing behavior.
6. Keep AI output as suggestions until the user confirms it.
