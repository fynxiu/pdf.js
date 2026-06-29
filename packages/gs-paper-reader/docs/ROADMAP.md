# Roadmap

This roadmap turns the paper-reader design into TDD-friendly implementation phases.

## Phase 0: package foundation

Status: scaffolded.

- Public package manifest.
- TypeScript and Vitest configuration.
- Public types.
- PDF.js viewer adapter.
- Overlay layer manager.
- Sentence segmentation and sentence index.
- Sentence Focus Mode.
- Annotation store contract.
- Evidence card service.
- Command registry.
- Testing utilities.
- Initial unit tests and documentation.

## Phase 1: production-ready reader MVP

Goal: make the viewer a comfortable daily paper reader.

Features:

- Custom toolbar integration in host app.
- Text selection floating menu.
- Save highlight / note / evidence from selection.
- Sentence Focus Mode keyboard UX.
- Continue-reading state.
- Left panel: pages / outline / annotations.
- Right panel: notes / evidence.
- Markdown export for annotations and evidence.

TDD requirements:

- Selection-to-annotation tests.
- Annotation rendering tests.
- Continue-reading store tests.
- Keyboard command tests.
- Export snapshot tests.

## Phase 2: systematic-review workflow

Goal: connect reading to review decisions and structured extraction.

Features:

- Evidence Card UI and persistence.
- Extraction schema and extraction values.
- Include / exclude / maybe decision panel.
- Criterion-linked evidence.
- Copy quote with citation.
- Evidence table export.

TDD requirements:

- Evidence provenance tests.
- Extraction schema validation tests.
- Decision audit-log tests.
- CSV/Markdown export tests.

## Phase 3: paper-structure intelligence

Goal: make navigation paper-aware rather than page-only.

Features:

- Section detection.
- Figure/table caption detection.
- Reference entry parsing.
- Citation marker linking.
- Section-aware search.

TDD requirements:

- Heading heuristic tests.
- Figure/table caption tests.
- Citation marker parsing tests.
- Search result grouping tests.

## Phase 4: AI-assisted review

Goal: add AI as a suggestion layer, not as an unreviewed data writer.

Features:

- Explain selected sentence.
- Summarize current paragraph/section.
- Suggest evidence type.
- Suggest extraction value.
- Find possible limitations.
- Compare selected passages across papers.

TDD requirements:

- Mock AI suggestion tests.
- Suggestion preview overlay tests.
- Confirm/reject tests.
- Provenance metadata tests.

## Phase 5: cross-paper research workspace

Goal: use the viewer as an entry point into a literature graph.

Features:

- Related paper panel.
- Cited/citing paper linking.
- Similar annotation lookup.
- Cross-paper evidence comparison.
- Team review conflict resolution.

TDD requirements:

- Graph query adapter tests.
- Cross-paper provenance tests.
- Conflict resolution state-machine tests.
