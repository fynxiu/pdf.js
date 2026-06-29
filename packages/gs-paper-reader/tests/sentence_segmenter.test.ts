import { describe, expect, it } from "vitest";
import { buildSentenceIndex, InMemorySentenceIndex, segmentSentences } from "../src/sentence_segmenter.js";

describe("segmentSentences", () => {
  it("segments page text into sentence refs", () => {
    const sentences = segmentSentences({
      pageIndex: 0,
      text: "This is the first sentence. This is the second sentence.",
    });

    expect(sentences).toHaveLength(2);
    expect(sentences[0]?.id).toBe("p1:s1");
    expect(sentences[0]?.text).toBe("This is the first sentence.");
    expect(sentences[1]?.text).toBe("This is the second sentence.");
  });

  it("builds a cross-page ordered sentence index", () => {
    const index = buildSentenceIndex([
      { pageIndex: 0, text: "A. B." },
      { pageIndex: 1, text: "C." },
    ]);

    expect(index.sentences.map(sentence => sentence.text)).toEqual(["A.", "B.", "C."]);
    expect(index.getFirstOnPage(1)?.text).toBe("C.");
  });
});

describe("InMemorySentenceIndex", () => {
  it("moves relatively from the current sentence", () => {
    const index = new InMemorySentenceIndex([
      { id: "s1", ordinal: 0, pageIndex: 0, startOffset: 0, endOffset: 2, text: "A." },
      { id: "s2", ordinal: 1, pageIndex: 0, startOffset: 3, endOffset: 5, text: "B." },
    ]);

    expect(index.getRelative("s1", 1)?.id).toBe("s2");
    expect(index.getRelative("s2", -1)?.id).toBe("s1");
    expect(index.getRelative("s2", 1)).toBeNull();
  });
});
