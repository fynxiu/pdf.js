import { InMemoryAnnotationStore, type AnnotationStore } from "./annotation_store.js";
import { CommandRegistry, createDefaultCommands } from "./command_registry.js";
import { EvidenceService } from "./evidence.js";
import { OverlayLayerManager } from "./overlay_layer.js";
import { createPdfJsViewerAdapter } from "./pdfjs_viewer_adapter.js";
import { SentenceFocusController } from "./reading_focus.js";
import { InMemorySentenceIndex } from "./sentence_segmenter.js";
import type { PdfJsApplicationLike, SentenceIndex, ViewerAdapter } from "./types.js";

export interface PaperReaderOptions {
  app?: PdfJsApplicationLike;
  viewer?: ViewerAdapter;
  sentenceIndex?: SentenceIndex;
  annotationStore?: AnnotationStore;
  registerDefaultCommands?: boolean;
}

export class PaperReader {
  readonly viewer: ViewerAdapter;
  readonly overlays: OverlayLayerManager;
  readonly sentenceFocus: SentenceFocusController;
  readonly annotations: AnnotationStore;
  readonly evidence: EvidenceService;
  readonly commands: CommandRegistry;

  constructor(options: PaperReaderOptions = {}) {
    this.viewer = options.viewer ?? createPdfJsViewerAdapter(options.app);
    this.overlays = new OverlayLayerManager(this.viewer);
    this.annotations = options.annotationStore ?? new InMemoryAnnotationStore();
    this.evidence = new EvidenceService();
    this.commands = new CommandRegistry();

    const sentenceIndex = options.sentenceIndex ?? new InMemorySentenceIndex([]);
    this.sentenceFocus = new SentenceFocusController({
      viewer: this.viewer,
      overlays: this.overlays,
      sentenceIndex,
    });

    if (options.registerDefaultCommands ?? true) {
      for (const command of createDefaultCommands()) {
        this.commands.register(command);
      }
    }
  }
}

export function createPaperReader(options: PaperReaderOptions = {}): PaperReader {
  return new PaperReader(options);
}
