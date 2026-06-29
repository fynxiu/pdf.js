import type { SentenceRef } from "@gs/paper-reader";
import type { DemoSearchResult, PaperStructureIndex } from "./model.js";
export function buildPaperStructure(sentences: readonly SentenceRef[]): PaperStructureIndex {
  return {
    sections: sentences.filter(s => s.text.toLowerCase().startsWith("abstract.") || s.text.toLowerCase().startsWith("methods.") || s.text.toLowerCase().startsWith("results.") || s.text.toLowerCase().startsWith("references.")).map((s, i) => ({ id: `section-${i + 1}`, title: s.text.split(".")[0] || "Section", normalizedType: (s.text.split(".")[0] || "section").toLowerCase(), pageIndex: s.pageIndex, sentenceId: s.id })),
    visuals: sentences.filter(s => s.text.startsWith("Figure") || s.text.startsWith("Table")).map((s, i) => ({ id: `visual-${i + 1}`, type: s.text.startsWith("Table") ? "table" : "figure", label: s.text.split(".")[0] || `Visual ${i + 1}`, caption: s.text, pageIndex: s.pageIndex, sentenceId: s.id })),
    references: sentences.filter(s => s.text.includes("[1]")).map((s, i) => ({ id: `ref-${i + 1}`, label: "[1]", text: s.text, pageIndex: s.pageIndex, sentenceId: s.id })),
  };
}
export function searchSentences(sentences: readonly SentenceRef[], query: string): DemoSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return sentences.filter(s => s.text.toLowerCase().includes(q)).map(s => ({ id: `search-${s.id}`, sentence: s, preview: s.text }));
}
