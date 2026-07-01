import type { PdfTextRange, SentenceRef } from "@gs/paper-reader";

export function findSentenceForSelection(
  sentences: readonly SentenceRef[],
  selection: Pick<PdfTextRange, "pageIndex" | "startOffset" | "endOffset"> | null
): SentenceRef | null {
  if (!selection) {
    return null;
  }

  const start = Math.min(selection.startOffset, selection.endOffset);
  const end = Math.max(selection.startOffset, selection.endOffset);
  let best: { sentence: SentenceRef; overlap: number } | null = null;

  for (const sentence of sentences) {
    if (sentence.pageIndex !== selection.pageIndex) {
      continue;
    }
    const overlap = Math.max(0, Math.min(end, sentence.endOffset) - Math.max(start, sentence.startOffset));
    if (overlap > 0 && (!best || overlap > best.overlap)) {
      best = { sentence, overlap };
    }
  }
  return best?.sentence ?? null;
}

export function findSentenceAtOffset(sentences: readonly SentenceRef[], pageIndex: number, offset: number): SentenceRef | null {
  const pageSentences = sentences.filter(sentence => sentence.pageIndex === pageIndex);
  const containing = pageSentences.find(sentence => offset >= sentence.startOffset && offset < sentence.endOffset);
  if (containing) {
    return containing;
  }
  if (pageSentences.some(sentence => sentence.startOffset === offset)) {
    return null;
  }
  return pageSentences.find(sentence => offset === sentence.endOffset) ?? null;
}
