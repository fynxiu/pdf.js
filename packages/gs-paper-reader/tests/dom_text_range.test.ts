import { describe, expect, it } from "vitest";
import { buildTextNodeMap, createRangeFromOffsets, getTextContext } from "../src/dom_text_range.js";

function createTextFixture(): HTMLElement {
  const root = document.createElement("div");
  const first = document.createElement("span");
  first.textContent = "Alpha";
  const second = document.createElement("span");
  second.textContent = " beta";
  root.append(first, second);
  return root;
}

describe("DOM text range helpers", () => {
  it("builds a flat text-node map from nested DOM", () => {
    const map = buildTextNodeMap(createTextFixture());

    expect(map.text).toBe("Alpha beta");
    expect(map.spans).toHaveLength(2);
    expect(map.spans[0]?.start).toBe(0);
    expect(map.spans[1]?.start).toBe(5);
  });

  it("creates a range from text offsets", () => {
    const range = createRangeFromOffsets(createTextFixture(), 0, 5);

    expect(range?.toString()).toBe("Alpha");
  });

  it("returns stable text context", () => {
    const context = getTextContext("abcdefghij", 4, 6, 2);

    expect(context).toEqual({ textBefore: "cd", textAfter: "gh" });
  });
});
