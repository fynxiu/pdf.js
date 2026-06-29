import { buildTextNodeMap, createRangeFromOffsets, getPageLocalRectsFromRange, InMemorySentenceIndex, type PageLocalRect, type SentenceRef } from "@gs/paper-reader";
import type { DemoViewerAdapter } from "./demo_viewer_adapter.js";

export interface DomSentenceIndexResult {
  index: InMemorySentenceIndex;
  sentences: SentenceRef[];
}

export function buildDomSentenceIndex(viewer: DemoViewerAdapter): DomSentenceIndexResult {
  const sentences: SentenceRef[] = [];
  let ordinal = 0;
  for (const page of Array.from(viewer.pages.values()).sort((a, b) => a.pageIndex - b.pageIndex)) {
    if (!page.textLayerDiv) continue;
    const map = buildTextNodeMap(page.textLayerDiv);
    for (const part of splitSentences(map.text)) {
      sentences.push({
        id: `p${page.pageIndex + 1}:s${ordinal + 1}`,
        ordinal,
        pageIndex: page.pageIndex,
        startOffset: part.start,
        endOffset: part.end,
        text: part.text,
      });
      ordinal += 1;
    }
  }
  return { index: new InMemorySentenceIndex(sentences), sentences };
}

export function getDomSentenceRects(viewer: DemoViewerAdapter, sentence: SentenceRef): PageLocalRect[] {
  const page = viewer.getPageHandle(sentence.pageIndex);
  if (!page?.textLayerDiv) return [];
  const range = createRangeFromOffsets(page.textLayerDiv, sentence.startOffset, sentence.endOffset);
  if (!range) return [];
  try {
    return getPageLocalRectsFromRange(range, page.div).filter(rect => rect.width > 0 && rect.height > 0);
  } finally {
    range.detach();
  }
}

function splitSentences(text: string): Array<{ start: number; end: number; text: string }> {
  const Segmenter = Intl.Segmenter;
  if (Segmenter) {
    return Array.from(new Segmenter("en", { granularity: "sentence" }).segment(text))
      .map(segment => ({ start: segment.index, end: segment.index + segment.segment.length, text: segment.segment.trim() }))
      .filter(segment => segment.text.length > 0);
  }
  const output: Array<{ start: number; end: number; text: string }> = [];
  const regexp = /[^.!?]+[.!?]+(?:["'”’)]*)|[^.!?]+$/g;
  let match: RegExpExecArray | null;
  while ((match = regexp.exec(text))) {
    const clean = match[0].trim();
    if (clean) output.push({ start: match.index, end: match.index + match[0].length, text: clean });
  }
  return output;
}
