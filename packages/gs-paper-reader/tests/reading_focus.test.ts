import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { OverlayLayerManager } from "../src/overlay_layer.js";
import { SentenceFocusController } from "../src/reading_focus.js";
import { InMemorySentenceIndex } from "../src/sentence_segmenter.js";
import { createMockPage, MockViewerAdapter } from "../src/testing/index.js";

function installFakeRects(): () => void {
  const originalGetClientRects = Range.prototype.getClientRects;
  Range.prototype.getClientRects = (() =>
    [
      {
        left: 10,
        top: 20,
        width: 100,
        height: 12,
        right: 110,
        bottom: 32,
        x: 10,
        y: 20,
        toJSON: () => undefined,
      },
    ] as unknown as DOMRectList) as typeof Range.prototype.getClientRects;

  return () => {
    Range.prototype.getClientRects = originalGetClientRects;
  };
}

function createSentenceIndex(): InMemorySentenceIndex {
  return new InMemorySentenceIndex([
    { id: "p1:s1", ordinal: 0, pageIndex: 0, startOffset: 0, endOffset: 15, text: "First sentence." },
    { id: "p1:s2", ordinal: 1, pageIndex: 0, startOffset: 16, endOffset: 32, text: "Second sentence." },
    { id: "p2:s1", ordinal: 2, pageIndex: 1, startOffset: 0, endOffset: 15, text: "Third sentence." },
  ]);
}

describe("SentenceFocusController", () => {
  let restoreDomMethods: () => void;
  let viewer: MockViewerAdapter;
  let controller: SentenceFocusController;

  beforeEach(() => {
    restoreDomMethods = installFakeRects();
    document.body.replaceChildren();
    viewer = new MockViewerAdapter();
    viewer.pages.set(0, createMockPage(0, "First sentence. Second sentence."));
    viewer.pages.set(1, createMockPage(1, "Third sentence."));
    controller = new SentenceFocusController({
      viewer,
      overlays: new OverlayLayerManager(viewer),
      sentenceIndex: createSentenceIndex(),
      scrollIntoView: false,
    });
  });

  afterEach(() => {
    restoreDomMethods();
  });

  it("enables focus mode at the first sentence on the current page", () => {
    const sentence = controller.enable();

    expect(sentence?.id).toBe("p1:s1");
    expect(controller.state.enabled).toBe(true);
    expect(controller.state.currentSentenceId).toBe("p1:s1");
  });

  it("moves to the next and previous sentence", () => {
    controller.enable("p1:s1");

    expect(controller.move(1)?.id).toBe("p1:s2");
    expect(controller.move(-1)?.id).toBe("p1:s1");
  });

  it("keeps only one reading-focus overlay when moving across pages", () => {
    controller.enable("p1:s1");
    expect(document.querySelectorAll("[data-overlay-kind='reading-focus']")).toHaveLength(1);

    controller.move(1);
    controller.move(1);

    const focusOverlays = document.querySelectorAll<HTMLElement>("[data-overlay-kind='reading-focus']");
    expect(focusOverlays).toHaveLength(1);
    expect(focusOverlays[0]?.dataset.sentenceId).toBe("p2:s1");
  });

  it("uses page-local scrolling instead of PDF destination scrolling", () => {
    controller = new SentenceFocusController({
      viewer,
      overlays: new OverlayLayerManager(viewer),
      sentenceIndex: createSentenceIndex(),
      scrollIntoView: true,
    });

    controller.enable("p1:s1");

    expect(viewer.scrollCalls).toEqual([
      { pageIndex: 0, rect: { x: 10, y: 20, width: 100, height: 12 } },
    ]);
  });

  it("clears focus state on disable", () => {
    controller.enable("p1:s1");
    controller.disable();

    expect(controller.state.enabled).toBe(false);
    expect(controller.state.currentSentenceId).toBeNull();
    expect(document.querySelectorAll("[data-overlay-kind='reading-focus']")).toHaveLength(0);
  });
});
