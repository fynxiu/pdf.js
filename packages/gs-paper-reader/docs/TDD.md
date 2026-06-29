# TDD Guide

This package should be developed test-first. The intended workflow is red, green, refactor.

## Commands

```bash
cd packages/gs-paper-reader
npm install
npm test
npm run typecheck
npm run build
```

## Test layers

### 1. Pure logic tests

Use for modules that do not need DOM or PDF.js:

- `sentence_segmenter.ts`
- `annotation_store.ts`
- `evidence.ts`
- `command_registry.ts`

Example:

```ts
it("moves to the next sentence", () => {
  const index = new InMemorySentenceIndex([...]);
  expect(index.getRelative("s1", 1)?.id).toBe("s2");
});
```

### 2. DOM tests

Use for text-layer and overlay behavior:

- `dom_text_range.ts`
- `overlay_layer.ts`
- `reading_focus.ts`

DOM tests should use `happy-dom` and the helpers in `@gs/paper-reader/testing`.

### 3. Adapter tests

Use mocks first. Avoid opening real PDFs in unit tests.

Test that adapters translate package-level commands to PDF.js-level behavior:

```text
viewer.nextPage() -> PDFViewerApplication.pdfViewer.currentPageNumber += 1
viewer.zoomIn()   -> eventBus.dispatch("zoomin")
```

Browser-level integration tests with real PDFs should be added later using Playwright or the existing PDF.js integration test infrastructure.

### 4. Workflow tests

Use for complete research flows:

```text
selection -> annotation -> evidence card
sentence focus -> save as annotation
AI suggestion -> user confirm -> extraction value
```

Workflow tests should use store interfaces, not real network calls.

## Definition of done for a feature

A feature is not complete until it has:

1. Public type definitions.
2. Unit tests for core behavior.
3. DOM tests when it renders or reads DOM.
4. API documentation.
5. AI-friendly documentation when a coding agent is expected to extend it.
6. Clear transient/session/persistent state classification.

## Recommended feature template

For a new feature, create:

```text
src/<feature>.ts
tests/<feature>.test.ts
docs/<feature>.md, when public or complex
```

Start with the test:

```ts
describe("FeatureName", () => {
  it("does the smallest externally visible behavior", () => {
    // Arrange
    // Act
    // Assert
  });
});
```

Then implement the minimum behavior. Refactor only after the test passes.

## Testing PDF coordinate behavior

Initial implementation may use DOM local rectangles for MVP behavior. Production annotation persistence should convert to PDF coordinate space.

When adding PDF coordinate conversion, write tests for:

- scale changes
- page rotation
- multiple rectangles for multi-line selections
- two-column text
- page rerendering

## Testing AI features

Never test AI features by calling a live model in unit tests.

Instead, model AI output as deterministic suggestions:

```ts
const suggestion = aiSuggestionService.createMockSuggestion({
  sourceText: "...",
  proposedEvidenceType: "result",
});
```

Then test:

```text
suggestion is rendered as transient overlay
suggestion is not persisted by default
user confirmation persists annotation/evidence/extraction
rejection clears suggestion
```
