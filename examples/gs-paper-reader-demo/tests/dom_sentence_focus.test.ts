import { describe, expect, it } from "vitest";
import type { DemoViewerAdapter } from "../src/demo_viewer_adapter.js";
import { buildDomSentenceIndex } from "../src/dom_sentence_focus.js";

function createViewer(text: string): DemoViewerAdapter {
  const pageDiv = document.createElement("div");
  pageDiv.className = "page";
  pageDiv.dataset.pageNumber = "1";

  const textLayerDiv = document.createElement("div");
  textLayerDiv.className = "textLayer";
  textLayerDiv.textContent = text;
  pageDiv.append(textLayerDiv);
  document.body.append(pageDiv);

  return {
    pages: new Map([
      [
        0,
        {
          pageIndex: 0,
          pageNumber: 1,
          div: pageDiv,
          textLayerDiv,
        },
      ],
    ]),
  } as unknown as DemoViewerAdapter;
}

describe("buildDomSentenceIndex", () => {
  it("trims whitespace from sentence offsets as well as sentence text", () => {
    const { sentences } = buildDomSentenceIndex(createViewer("First sentence.  Second sentence."));

    expect(sentences[0]).toMatchObject({
      startOffset: 0,
      endOffset: 15,
      text: "First sentence.",
    });
    expect(sentences[1]).toMatchObject({
      startOffset: 17,
      endOffset: 33,
      text: "Second sentence.",
    });
  });
});
