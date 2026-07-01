import { getPageLocalRectsForTextRange } from "./dom_text_range.js";
import type { OverlayLayerManager } from "./overlay_layer.js";
import type { PageLocalRect, ReadingFocusState, SentenceIndex, SentenceRef, ViewerAdapter } from "./types.js";

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
    this.overlays.clear(undefined, "reading-focus");

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
    const focusBounds = getBoundingPageLocalRect(rects);
    if (this.scrollIntoView && focusBounds) {
      if (this.viewer.scrollToPageLocalRect) {
        this.viewer.scrollToPageLocalRect(sentence.pageIndex, focusBounds);
      } else {
        this.viewer.scrollToPageRect(sentence.pageIndex, {
          x: focusBounds.left,
          y: focusBounds.top,
          width: focusBounds.width,
          height: focusBounds.height,
        });
      }
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

function getBoundingPageLocalRect(rects: readonly PageLocalRect[]): PageLocalRect | null {
  if (rects.length === 0) {
    return null;
  }
  const left = Math.min(...rects.map(rect => rect.left));
  const top = Math.min(...rects.map(rect => rect.top));
  const right = Math.max(...rects.map(rect => rect.left + rect.width));
  const bottom = Math.max(...rects.map(rect => rect.top + rect.height));
  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
  };
}
