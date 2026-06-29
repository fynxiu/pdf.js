import { describe, expect, it } from "vitest";
import { buildPaperStructure, searchSentences } from "../src/section_index.js";
import type { SentenceRef } from "@gs/paper-reader";
const sentences: SentenceRef[] = [
  { id: "s1", ordinal: 0, pageIndex: 0, startOffset: 0, endOffset: 20, text: "Abstract. This is a summary." },
  { id: "s2", ordinal: 1, pageIndex: 0, startOffset: 21, endOffset: 50, text: "Figure 1. Workflow caption." },
  { id: "s3", ordinal: 2, pageIndex: 1, startOffset: 0, endOffset: 30, text: "References. [1] PDF.js project." },
];
describe("buildPaperStructure", () => {
  it("detects sections, visual captions, and references", () => {
    const structure = buildPaperStructure(sentences);
    expect(structure.sections.map(section => section.normalizedType)).toContain("abstract");
    expect(structure.visuals[0]?.label).toBe("Figure 1");
    expect(structure.references[0]?.label).toBe("[1]");
  });
});
describe("searchSentences", () => {
  it("returns exact sentence matches", () => {
    const results = searchSentences(sentences, "workflow");
    expect(results).toHaveLength(1);
    expect(results[0]?.sentence.id).toBe("s2");
  });
});
