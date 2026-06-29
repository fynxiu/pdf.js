import { beforeEach, describe, expect, it } from "vitest";
import { OverlayLayerManager } from "../src/overlay_layer.js";
import { SentenceFocusController } from "../src/reading_focus.js";
import { InMemorySentenceIndex } from "../src/sentence_segmenter.js";
import { createMockPage, MockViewerAdapter } from "../src/testing/index.js";

describe("SentenceFocusController", () => {
  let viewer: MockViewerAdapter;
  let controller: SentenceFocusController;

  beforeEach(() => {
    document.body.replaceChildren();
    viewer = new MockViewerAdapter();
    viewer.pages.set(0, createMockPage(0, "First sentence. Second sentence."));
    const sentenceIndex = new InMemorySentenceIndex([
      { id: "p1:s1", ordinal: 0, pageIndex: 0, startOffset: 0, endOffset: 15, text: "First sentence." },
      { id: "p1:s2", ordinal: 1, pageIndex: 0, startOffset: 16, endOffset: 32, text: "Second sentence." },
    ]);
    controller = new SentenceFocusController({
      viewer,
      overlays: new OverlayLayerManager(viewer),
      sentenceIndex,
      scrollIntoView: false,
    });
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

  it("clears focus state on disable", () => {
    controller.enable("p1:s1");
    controller.disable();

    expect(controller.state.enabled).toBe(false);
    expect(controller.state.currentSentenceId).toBeNull();
  });
});
