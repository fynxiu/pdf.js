import type { PdfTextRange, SentenceIndex, SentenceRef } from "./types.js";

const ABBREVIATION_PLACEHOLDER = "<prd>";
const COMMON_ABBREVIATIONS = [
  "al.",
  "Dr.",
  "Prof.",
  "Mr.",
  "Mrs.",
  "Ms.",
  "Fig.",
  "Eq.",
  "Eqs.",
  "Table.",
  "No.",
  "vs.",
  "e.g.",
  "i.e.",
  "cf.",
  "etc.",
];

export interface SegmentPageInput {
  pageIndex: number;
  text: string;
  locale?: string;
  baseOrdinal?: number;
}

export function segmentSentences(input: SegmentPageInput): SentenceRef[] {
  const { pageIndex, text, locale = "en", baseOrdinal = 0 } = input;
  if (!text.trim()) {
    return [];
  }

  const nativeSegments = segmentWithIntl(text, locale);
  const segments = nativeSegments.length > 0 ? nativeSegments : segmentWithFallback(text);

  return segments
    .map((segment, index) => ({
      id: `p${pageIndex + 1}:s${baseOrdinal + index + 1}`,
      ordinal: baseOrdinal + index,
      pageIndex,
      startOffset: segment.startOffset,
      endOffset: segment.endOffset,
      text: segment.text,
    }))
    .filter(sentence => sentence.text.trim().length > 0);
}

interface RawSentenceSegment {
  startOffset: number;
  endOffset: number;
  text: string;
}

function segmentWithIntl(text: string, locale: string): RawSentenceSegment[] {
  const Segmenter = Intl.Segmenter;
  if (!Segmenter) {
    return [];
  }

  const segmenter = new Segmenter(locale, { granularity: "sentence" });
  return Array.from(segmenter.segment(text)).map(segment => ({
    startOffset: segment.index,
    endOffset: segment.index + segment.segment.length,
    text: segment.segment.trim(),
  }));
}

function segmentWithFallback(text: string): RawSentenceSegment[] {
  let protectedText = text;
  for (const abbreviation of COMMON_ABBREVIATIONS) {
    const safe = abbreviation.replaceAll(".", ABBREVIATION_PLACEHOLDER);
    protectedText = protectedText.replaceAll(abbreviation, safe);
  }

  const segments: RawSentenceSegment[] = [];
  const regexp = /[^.!?]+[.!?]+(?:["'”’)]*)|[^.!?]+$/g;
  let match: RegExpExecArray | null;
  while ((match = regexp.exec(protectedText)) !== null) {
    const raw = match[0];
    const startOffset = match.index;
    const endOffset = startOffset + raw.length;
    const restored = raw.replaceAll(ABBREVIATION_PLACEHOLDER, ".");
    segments.push({ startOffset, endOffset, text: restored.trim() });
  }
  return segments;
}

export class InMemorySentenceIndex implements SentenceIndex {
  readonly sentences: readonly SentenceRef[];
  private readonly byId: Map<string, SentenceRef>;

  constructor(sentences: readonly SentenceRef[]) {
    this.sentences = [...sentences].sort((a, b) => a.ordinal - b.ordinal);
    this.byId = new Map(this.sentences.map(sentence => [sentence.id, sentence]));
  }

  getById(id: string): SentenceRef | null {
    return this.byId.get(id) ?? null;
  }

  getRelative(id: string | null, delta: -1 | 1): SentenceRef | null {
    if (!this.sentences.length) {
      return null;
    }
    if (!id) {
      return delta > 0 ? this.sentences[0] ?? null : this.sentences[this.sentences.length - 1] ?? null;
    }
    const currentIndex = this.sentences.findIndex(sentence => sentence.id === id);
    if (currentIndex < 0) {
      return null;
    }
    return this.sentences[currentIndex + delta] ?? null;
  }

  getFirstOnPage(pageIndex: number): SentenceRef | null {
    return this.sentences.find(sentence => sentence.pageIndex === pageIndex) ?? null;
  }
}

export function buildSentenceIndex(pages: Array<Pick<PdfTextRange, "pageIndex" | "text">>, locale = "en"): InMemorySentenceIndex {
  const sentences: SentenceRef[] = [];
  let ordinal = 0;
  for (const page of pages) {
    const pageSentences = segmentSentences({
      pageIndex: page.pageIndex,
      text: page.text,
      locale,
      baseOrdinal: ordinal,
    });
    sentences.push(...pageSentences);
    ordinal += pageSentences.length;
  }
  return new InMemorySentenceIndex(sentences);
}
