import { describe, expect, it } from "vitest";
import { findSentenceAtOffset, findSentenceForSelection } from "../src/sentence_focus_selection.js";
import type { SentenceRef } from "@gs/paper-reader";

function sentence(id: string, startOffset: number, endOffset: number, pageIndex = 0): SentenceRef {
  return {
    id,
    ordinal: Number(id.replace(/\D/g, "")) || 0,
    pageIndex,
    startOffset,
    endOffset,
    text: id,
  };
}

describe("sentence focus selection", () => {
  it("finds the sentence overlapped by a partial text selection", () => {
    const sentences = [sentence("s1", 0, 20), sentence("s2", 21, 80), sentence("s3", 81, 120)];

    expect(findSentenceForSelection(sentences, { pageIndex: 0, startOffset: 35, endOffset: 41 })?.id).toBe("s2");
  });

  it("chooses the same-page sentence with the largest overlap", () => {
    const sentences = [sentence("s1", 0, 20), sentence("s2", 21, 80), sentence("s3", 60, 120), sentence("s4", 21, 80, 1)];

    expect(findSentenceForSelection(sentences, { pageIndex: 0, startOffset: 70, endOffset: 110 })?.id).toBe("s3");
  });

  it("finds the sentence containing a clicked text offset", () => {
    const sentences = [sentence("s1", 0, 20), sentence("s2", 21, 80), sentence("s3", 81, 120), sentence("s4", 21, 80, 1)];

    expect(findSentenceAtOffset(sentences, 0, 21)?.id).toBe("s2");
    expect(findSentenceAtOffset(sentences, 0, 80)?.id).toBe("s2");
    expect(findSentenceAtOffset(sentences, 1, 35)?.id).toBe("s4");
    expect(findSentenceAtOffset(sentences, 0, 20.5)).toBeNull();
  });

  it("prefers the next sentence at a shared text offset boundary", () => {
    const sentences = [sentence("s1", 0, 20), sentence("s2", 20, 40)];

    expect(findSentenceAtOffset(sentences, 0, 20)?.id).toBe("s2");
  });
});
