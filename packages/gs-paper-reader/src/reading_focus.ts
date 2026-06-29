import { getPageLocalRectsForTextRange } from "./dom_text_range.js";
import type { OverlayLayerManager } from "./overlay_layer.js";
import type { ReadingFocusState, SentenceIndex, SentenceRef, ViewerAdapter } from "./types.js";

export interface SentenceFocusControllerOptions {
  viewer: ViewerAdapter;
  overlays: OverlayLayerManager;
  sentenceIndex: SentenceIndex;
  scrollIntoView?: boolean;
}

export class SentenceFocusController {
  readonly state: ReadingFocusState = {
    enabled: false,
    currentSentenceId: null,
    mode: "focus",
  };

  private readonly viewer: ViewerAdapter;
  private readonly overlays: OverlayLayerManager;
  private readonly sentenceIndex: SentenceIndex;
  private readonly scrollIntoView: boolean;

  constructor(options: SentenceFocusControllerOptions) {
    this.viewer = options.viewer;
    this.overlays = options.overlays;
    this.sentenceIndex = options.sentenceIndex;
    this.scrollIntoView = options.scrollIntoView ?? true;
  }

  enable(startSentenceId?: string): SentenceRef | null {
    this.state.enabled = true;
    const sentence = startSentenceId
      ? this.sentenceIndex.getById(startSentenceId)
      : this.sentenceIndex.getFirstOnPage(this.viewer.getCurrentPage() - 1) ?? this.sentenceIndex.getRelative(null, 1);
    if (!sentence) {
      return null;
    }
    this.focus(sentence);
    return sentence;
  }

  disable(): void {
    this.state.enabled = false;
    this.state.currentSentenceId = null;
    this.overlays.clear(undefined, "reading-focus");
  }

  move(delta: -1 | 1): SentenceRef | null {
    if (!this.state.enabled) {
      return this.enable();
    }
    const next = this.sentenceIndex.getRelative(this.state.currentSentenceId, delta);
    if (!next) {
      return null;
    }
    this.focus(next);
    return next;
  }

  focus(sentence: SentenceRef): void {
    const page = this.viewer.getPageHandle(sentence.pageIndex);
    if (!page?.textLayerDiv) {
      this.state.currentSentenceId = sentence.id;
      return;
    }

    const rects = getPageLocalRectsForTextRange(page.div, page.textLayerDiv, sentence);
    this.overlays.render({
      pageIndex: sentence.pageIndex,
      kind: "reading-focus",
      rects,
      dataset: {
        sentenceId: sentence.id,
      },
    });

    this.state.currentSentenceId = sentence.id;
    if (this.scrollIntoView && rects[0]) {
      this.viewer.scrollToPageRect(sentence.pageIndex, {
        x: rects[0].left,
        y: rects[0].top,
        width: rects[0].width,
        height: rects[0].height,
      });
    }
  }

  bindKeyboard(target: EventTarget = document): () => void {
    const onKeyDown = (event: Event) => {
      if (!(event instanceof KeyboardEvent) || !this.state.enabled) {
        return;
      }
      if (event.key === "ArrowDown" || event.key === "j" || event.key === " ") {
        event.preventDefault();
        this.move(1);
      } else if (event.key === "ArrowUp" || event.key === "k") {
        event.preventDefault();
        this.move(-1);
      } else if (event.key === "Escape") {
        event.preventDefault();
        this.disable();
      }
    };

    target.addEventListener("keydown", onKeyDown);
    return () => target.removeEventListener("keydown", onKeyDown);
  }
}
