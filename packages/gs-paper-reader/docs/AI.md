# AI-Friendly Development Guide

This document is written for coding agents and AI assistants that extend `@gs/paper-reader`.

## Core principle

Do not modify PDF.js internals for research workflow features unless there is no adapter-level solution.

Prefer this:

```text
PDF.js Viewer -> PdfJsViewerAdapter -> @gs/paper-reader module -> host app UI
```

Avoid this:

```text
feature code directly edits web/viewer.html, web/toolbar.js, or PDF.js search highlight DOM
```

## Important concepts

### Transient overlay

Temporary visual state. Examples:

- current sentence focus
- AI suggestion preview
- hover preview
- search result preview

Use `OverlayLayerManager`. Do not persist by default.

### Persistent annotation

User-confirmed research data. Examples:

- highlight
- note
- evidence quote
- method note
- limitation note

Use `AnnotationStore`.

### Evidence card

A stronger research object derived from a confirmed annotation. Evidence cards must preserve quote provenance.

Use `EvidenceService.fromAnnotation()`.

### Sentence focus

A reading mode that highlights one sentence at a time. It is temporary and should not write annotations unless the user explicitly asks to save the current sentence.

Use `SentenceFocusController`.

## Safe extension checklist

Before changing code, answer:

1. Is this feature transient, session-level, or persistent?
2. Does it require PDF.js internals, or can it use `ViewerAdapter`?
3. Does it render a temporary visual element? Use `OverlayLayerManager`.
4. Does it save research data? Use a store contract.
5. Does it need a command palette entry? Register a `ReaderCommand`.
6. Does it need AI output? Store it as a suggestion until user confirmation.
7. Is there a test before implementation?

## Adding a new command

```ts
registry.register({
  id: "selection.saveAsMethodEvidence",
  title: "Save selected text as method evidence",
  shortcut: "m",
  isEnabled: context => Boolean(context.selection?.text),
  run: async context => {
    const selection = context.selection;
    if (!selection) return;
    // Call host app annotation store.
  },
});
```

Command id convention:

```text
viewer.*
selection.*
annotation.*
evidence.*
extraction.*
ai.*
focus.*
```

## Adding a new overlay kind

1. Extend `OverlayKind` in `src/types.ts`.
2. Add styles in `src/styles.css`.
3. Add tests in `tests/overlay_layer.test.ts` or a dedicated feature test.
4. Document whether it is transient or persistent.

## Adding a new persistent workflow

For example, adding `ExtractionStore`:

1. Add public types in `src/types.ts`.
2. Add store contract in `src/extraction_store.ts`.
3. Add in-memory implementation for tests.
4. Add tests before UI integration.
5. Export from `src/index.ts`.
6. Add docs in `docs/API.md`.

## AI output policy for this package

AI output must be treated as unconfirmed suggestion data.

Recommended flow:

```text
source selection/section/page
-> AI suggestion
-> transient overlay / side-panel preview
-> user confirmation
-> persistent annotation/evidence/extraction value
```

Do not write AI-generated claims directly into persistent research data without explicit user confirmation.

## Common mistakes to avoid

- Do not use PDF.js `.highlight` search DOM for research annotations.
- Do not store only screen coordinates for persistent annotations.
- Do not let sentence focus create annotations automatically.
- Do not add hard dependencies on React, Vue, or a specific host framework to this core package.
- Do not call live AI services in unit tests.
- Do not add app-specific backend URLs to the package.

## Suggested coding-agent prompt

Use this prompt when asking an AI agent to add a feature:

```text
You are editing packages/gs-paper-reader.
Follow docs/AI.md and docs/TDD.md.
Do not modify PDF.js internals unless absolutely necessary.
Start with tests.
Classify the feature as transient, session-level, or persistent.
Use ViewerAdapter for viewer access.
Use OverlayLayerManager for temporary rectangles.
Use store contracts for persisted research data.
Update docs/API.md and README.md when public API changes.
```
