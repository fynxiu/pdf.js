import { getPageLocalRectsFromRange } from "@gs/paper-reader";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("PDF text selection rectangles", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses individual selected text-node rectangles instead of one bridged range rectangle", () => {
    const page = document.createElement("section");
    const textLayer = document.createElement("div");
    const leftLine = document.createElement("span");
    const nextLeftLine = document.createElement("span");
    leftLine.textContent = "Left column first line";
    nextLeftLine.textContent = " left column second line";
    textLayer.append(leftLine, nextLeftLine);
    page.append(textLayer);
    document.body.append(page);

    vi.spyOn(page, "getBoundingClientRect").mockReturnValue({ left: 0, top: 0 } as DOMRect);
    vi.spyOn(Range.prototype, "getClientRects").mockImplementation(function (this: Range) {
      if (this.startContainer === leftLine.firstChild && this.endContainer === nextLeftLine.firstChild) {
        return [{ left: 10, top: 20, width: 460, height: 10 }] as unknown as DOMRectList;
      }
      if (this.startContainer === leftLine.firstChild) {
        return [{ left: 10, top: 20, width: 120, height: 10 }] as unknown as DOMRectList;
      }
      if (this.startContainer === nextLeftLine.firstChild) {
        return [{ left: 10, top: 34, width: 150, height: 10 }] as unknown as DOMRectList;
      }
      return [] as unknown as DOMRectList;
    });

    const range = document.createRange();
    range.setStart(leftLine.firstChild!, 0);
    range.setEnd(nextLeftLine.firstChild!, nextLeftLine.textContent!.length);

    expect(getPageLocalRectsFromRange(range, page)).toEqual([
      { left: 10, top: 20, width: 120, height: 10 },
      { left: 10, top: 34, width: 150, height: 10 },
    ]);
  });

  it("uses a text-node rectangle when the selected range root is the text node", () => {
    const page = document.createElement("section");
    const line = document.createElement("span");
    line.textContent = "Left column";
    page.append(line);
    document.body.append(page);

    vi.spyOn(page, "getBoundingClientRect").mockReturnValue({ left: 0, top: 0 } as DOMRect);
    vi.spyOn(Range.prototype, "getClientRects").mockImplementation(function (this: Range) {
      if (this.startContainer === line.firstChild) {
        return [{ left: 24, top: 30, width: 80, height: 10 }] as unknown as DOMRectList;
      }
      return [{ left: 24, top: 30, width: 420, height: 10 }] as unknown as DOMRectList;
    });

    const range = document.createRange();
    range.setStart(line.firstChild!, 0);
    range.setEnd(line.firstChild!, line.textContent!.length);

    expect(getPageLocalRectsFromRange(range, page)).toEqual([{ left: 24, top: 30, width: 80, height: 10 }]);
  });
});
