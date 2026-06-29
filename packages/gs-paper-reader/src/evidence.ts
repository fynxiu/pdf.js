import type { EvidenceCard, ReviewAnnotation } from "./types.js";

export interface NewEvidenceCard {
  annotation: ReviewAnnotation;
  evidenceType: EvidenceCard["evidenceType"];
  userInterpretation?: string;
  confidence?: EvidenceCard["confidence"];
}

export interface EvidenceServiceOptions {
  idFactory?: () => string;
  now?: () => Date;
}

export class EvidenceService {
  private readonly idFactory: () => string;
  private readonly now: () => Date;

  constructor(options: EvidenceServiceOptions = {}) {
    this.idFactory = options.idFactory ?? (() => crypto.randomUUID());
    this.now = options.now ?? (() => new Date());
  }

  fromAnnotation(input: NewEvidenceCard): EvidenceCard {
    const { annotation } = input;
    return {
      id: this.idFactory(),
      annotationId: annotation.id,
      paperId: annotation.paperId,
      quote: annotation.text,
      evidenceType: input.evidenceType,
      userInterpretation: input.userInterpretation,
      confidence: input.confidence,
      linkedReviewQuestionId: annotation.linkedReviewQuestionId,
      linkedCriterionId: annotation.linkedCriterionId,
      extractionFieldId: annotation.extractionFieldId,
      createdAt: this.now().toISOString(),
    };
  }
}
