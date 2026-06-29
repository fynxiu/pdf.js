export type PdfPageIndex = number;

export type PdfScaleValue =
  | number
  | "auto"
  | "page-actual"
  | "page-fit"
  | "page-width";

export type ReadingMode = "normal" | "skim" | "focus" | "annotation" | "extraction";

export type OverlayKind =
  | "reading-focus"
  | "search-preview"
  | "annotation"
  | "ai-suggestion"
  | "hover";

export interface PdfRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PageLocalRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface PdfTextRange {
  pageIndex: PdfPageIndex;
  startOffset: number;
  endOffset: number;
  text: string;
  textBefore?: string;
  textAfter?: string;
}

export interface PdfTextSelection extends PdfTextRange {
  rects: PdfRect[];
}

export interface PageHandle {
  pageIndex: PdfPageIndex;
  pageNumber: number;
  div: HTMLElement;
  textLayerDiv: HTMLElement | null;
  viewport?: unknown;
}

export interface VisiblePageRef {
  pageIndex: PdfPageIndex;
  pageNumber: number;
  percentVisible?: number;
}

export interface PdfJsApplicationLike {
  pdfViewer: {
    currentPageNumber: number;
    currentScaleValue?: string;
    currentScale?: number;
    pagesCount?: number;
    getPageView?(pageIndex: number): unknown;
    scrollPageIntoView?(params: {
      pageNumber: number;
      destArray?: unknown[];
      allowNegativeOffset?: boolean;
    }): void;
  };
  eventBus?: {
    dispatch(name: string, payload?: Record<string, unknown>): void;
  };
}

export interface ViewerAdapter {
  getCurrentPage(): number;
  getPageCount(): number | null;
  goToPage(pageNumber: number): void;
  previousPage(): void;
  nextPage(): void;
  getScale(): PdfScaleValue | null;
  setScale(scale: PdfScaleValue): void;
  zoomIn(): void;
  zoomOut(): void;
  getPageHandle(pageIndex: PdfPageIndex): PageHandle | null;
  getVisiblePages(): VisiblePageRef[];
  getSelection(): PdfTextSelection | null;
  clearSelection(): void;
  scrollToPageRect(pageIndex: PdfPageIndex, rect: PdfRect): void;
}

export interface SentenceRef extends PdfTextRange {
  id: string;
  ordinal: number;
}

export interface SentenceIndex {
  readonly sentences: readonly SentenceRef[];
  getById(id: string): SentenceRef | null;
  getRelative(id: string | null, delta: -1 | 1): SentenceRef | null;
  getFirstOnPage(pageIndex: PdfPageIndex): SentenceRef | null;
}

export interface ReadingFocusState {
  enabled: boolean;
  currentSentenceId: string | null;
  mode: Extract<ReadingMode, "focus">;
}

export interface OverlayRectInput {
  pageIndex: PdfPageIndex;
  kind: OverlayKind;
  rects: PageLocalRect[];
  className?: string;
  dataset?: Record<string, string>;
}

export type AnnotationType =
  | "highlight"
  | "note"
  | "evidence"
  | "question"
  | "claim"
  | "method"
  | "result"
  | "limitation"
  | "todo";

export interface ReviewAnnotation {
  id: string;
  paperId: string;
  pdfFingerprint?: string;
  type: AnnotationType;
  pageIndex: PdfPageIndex;
  rectsPdfSpace: PdfRect[];
  text: string;
  textBefore?: string;
  textAfter?: string;
  note?: string;
  color?: string;
  tags?: string[];
  linkedReviewQuestionId?: string;
  linkedCriterionId?: string;
  extractionFieldId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
  aiProvenance?: AiProvenance;
}

export interface NewReviewAnnotation {
  paperId: string;
  pdfFingerprint?: string;
  type: AnnotationType;
  pageIndex: PdfPageIndex;
  rectsPdfSpace: PdfRect[];
  text: string;
  textBefore?: string;
  textAfter?: string;
  note?: string;
  color?: string;
  tags?: string[];
  linkedReviewQuestionId?: string;
  linkedCriterionId?: string;
  extractionFieldId?: string;
  createdBy?: string;
  aiProvenance?: AiProvenance;
}

export interface EvidenceCard {
  id: string;
  annotationId: string;
  paperId: string;
  quote: string;
  evidenceType:
    | "background"
    | "definition"
    | "method"
    | "result"
    | "limitation"
    | "claim"
    | "counterclaim";
  userInterpretation?: string;
  confidence?: "low" | "medium" | "high";
  linkedReviewQuestionId?: string;
  linkedCriterionId?: string;
  extractionFieldId?: string;
  createdAt: string;
}

export interface AiProvenance {
  model?: string;
  promptTemplateId?: string;
  sourceAnnotationIds?: string[];
  sourceQuoteIds?: string[];
  userConfirmed: boolean;
  createdAt: string;
}

export interface ExtractionSchemaField {
  id: string;
  label: string;
  description?: string;
  kind: "text" | "number" | "boolean" | "enum" | "quote";
  required?: boolean;
  enumValues?: string[];
}

export interface ExtractionSchema {
  id: string;
  name: string;
  fields: ExtractionSchemaField[];
}

export interface ExtractionValue {
  fieldId: string;
  value: string | number | boolean | null;
  evidenceAnnotationIds?: string[];
  updatedAt: string;
}

export interface PaperReadingState {
  paperId: string;
  userId?: string;
  currentPage: number;
  currentSentenceId?: string;
  currentSectionId?: string;
  scale: PdfScaleValue;
  scrollTop?: number;
  readingMode: ReadingMode;
  updatedAt: string;
}

export interface CommandContext {
  viewer: ViewerAdapter;
  sentenceIndex?: SentenceIndex;
  activeAnnotation?: ReviewAnnotation;
  selection?: PdfTextSelection | null;
}

export interface ReaderCommand {
  id: string;
  title: string;
  description?: string;
  shortcut?: string;
  run(context: CommandContext): void | Promise<void>;
  isEnabled?(context: CommandContext): boolean;
}
