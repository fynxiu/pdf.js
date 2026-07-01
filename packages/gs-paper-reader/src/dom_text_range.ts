import type { PageLocalRect, PdfTextRange } from "./types.js";

export interface TextNodeSpan {
  node: Text;
  start: number;
  end: number;
}

export interface TextNodeMap {
  text: string;
  spans: TextNodeSpan[];
}

export function buildTextNodeMap(root: Node): TextNodeMap {
  const walker = root.ownerDocument?.createTreeWalker(root, NodeFilter.SHOW_TEXT) ?? null;
  if (!walker) {
    return { text: "", spans: [] };
  }

  let text = "";
  const spans: TextNodeSpan[] = [];
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const value = node.nodeValue ?? "";
    if (value.length === 0) {
      continue;
    }
    const start = text.length;
    text += value;
    spans.push({ node, start, end: text.length });
  }
  return { text, spans };
}

function findSpan(spans: readonly TextNodeSpan[], offset: number): TextNodeSpan | null {
  if (spans.length === 0) {
    return null;
  }
  for (const span of spans) {
    if (offset >= span.start && offset <= span.end) {
      return span;
    }
  }
  const last = spans[spans.length - 1]!;
  return offset >= last.end ? last : null;
}

export function createRangeFromOffsets(root: Node, startOffset: number, endOffset: number): Range | null {
  const map = buildTextNodeMap(root);
  const start = Math.max(0, Math.min(startOffset, map.text.length));
  const end = Math.max(start, Math.min(endOffset, map.text.length));
  const startSpan = findSpan(map.spans, start);
  const endSpan = findSpan(map.spans, end);

  if (!startSpan || !endSpan) {
    return null;
  }

  const range = (root.ownerDocument ?? document).createRange();
  range.setStart(startSpan.node, Math.max(0, start - startSpan.start));
  range.setEnd(endSpan.node, Math.max(0, end - endSpan.start));
  return range;
}

export function getPageLocalRectsFromRange(range: Range, pageDiv: HTMLElement): PageLocalRect[] {
  const pageBox = pageDiv.getBoundingClientRect();
  return getRangeClientRects(range)
    .filter(rect => rect.width > 0 && rect.height > 0)
    .map(rect => ({
      left: rect.left - pageBox.left,
      top: rect.top - pageBox.top,
      width: rect.width,
      height: rect.height,
    }));
}

function getRangeClientRects(range: Range): DOMRect[] {
  const textNodeRects = getSelectedTextNodeRects(range);
  return textNodeRects.length > 0 ? textNodeRects : Array.from(range.getClientRects());
}

function getSelectedTextNodeRects(range: Range): DOMRect[] {
  const root = range.commonAncestorContainer;
  const document = root.ownerDocument;
  if (!document) {
    return [];
  }

  const rects: DOMRect[] = [];
  if (root.nodeType === Node.TEXT_NODE) {
    appendSelectedTextNodeRects(range, root as Text, rects);
    return rects;
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: node => {
      if (!node.nodeValue || !range.intersectsNode(node)) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  while (walker.nextNode()) {
    appendSelectedTextNodeRects(range, walker.currentNode as Text, rects);
  }
  return rects;
}

function appendSelectedTextNodeRects(range: Range, node: Text, rects: DOMRect[]): void {
  const startOffset = node === range.startContainer ? range.startOffset : 0;
  const endOffset = node === range.endContainer ? range.endOffset : node.length;
  if (startOffset >= endOffset) {
    return;
  }

  const nodeRange = node.ownerDocument.createRange();
  try {
    nodeRange.setStart(node, startOffset);
    nodeRange.setEnd(node, endOffset);
    rects.push(...Array.from(nodeRange.getClientRects()));
  } finally {
    nodeRange.detach();
  }
}

export function getPageLocalRectsForTextRange(
  pageDiv: HTMLElement,
  textLayerDiv: HTMLElement,
  range: Pick<PdfTextRange, "startOffset" | "endOffset">
): PageLocalRect[] {
  const domRange = createRangeFromOffsets(textLayerDiv, range.startOffset, range.endOffset);
  if (!domRange) {
    return [];
  }
  try {
    return getPageLocalRectsFromRange(domRange, pageDiv);
  } finally {
    domRange.detach();
  }
}

export function getTextContext(text: string, startOffset: number, endOffset: number, contextChars = 120) {
  return {
    textBefore: text.slice(Math.max(0, startOffset - contextChars), startOffset),
    textAfter: text.slice(endOffset, Math.min(text.length, endOffset + contextChars)),
  };
}
