import type { EvidenceCard, PageLocalRect, ReviewAnnotation, SentenceRef } from "@gs/paper-reader";
export type RightPanelTab = "notes" | "evidence" | "ai" | "extraction" | "decision" | "metadata";
export type ReviewDecisionValue = "unreviewed" | "accept" | "reject" | "maybe";
export interface DemoAnnotationRecord { annotation: ReviewAnnotation; pageLocalRects: PageLocalRect[] }
export interface DemoEvidenceRecord { evidence: EvidenceCard; annotation: ReviewAnnotation }
export interface DemoSection { id: string; title: string; normalizedType: string; pageIndex: number; sentenceId: string }
export interface DemoVisualObject { id: string; type: "figure" | "table"; label: string; caption: string; pageIndex: number; sentenceId: string }
export interface DemoReference { id: string; label: string; text: string; pageIndex: number; sentenceId: string }
export interface DemoSearchResult { id: string; sentence: SentenceRef; preview: string }
export interface PaperStructureIndex { sections: DemoSection[]; visuals: DemoVisualObject[]; references: DemoReference[] }
export const EXTRACTION_FIELDS = [
  { id: "population", label: "Population", help: "Study material." },
  { id: "method", label: "Method", help: "Design or analysis method." },
  { id: "finding", label: "Main finding", help: "Result or claim." },
  { id: "limitation", label: "Limitation", help: "Limitation or uncertainty." },
];
