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
    const card: EvidenceCard = {
      id: this.idFactory(),
      annotationId: annotation.id,
      paperId: annotation.paperId,
      quote: annotation.text,
      evidenceType: input.evidenceType,
      createdAt: this.now().toISOString(),
    };

    if (input.userInterpretation) {
      card.userInterpretation = input.userInterpretation;
    }
    if (input.confidence) {
      card.confidence = input.confidence;
    }
    if (annotation.linkedReviewQuestionId) {
      card.linkedReviewQuestionId = annotation.linkedReviewQuestionId;
    }
    if (annotation.linkedCriterionId) {
      card.linkedCriterionId = annotation.linkedCriterionId;
    }
    if (annotation.extractionFieldId) {
      card.extractionFieldId = annotation.extractionFieldId;
    }

    return card;
  }
}
