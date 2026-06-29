import { describe, expect, it } from "vitest";
import { EvidenceService } from "../src/evidence.js";

describe("EvidenceService", () => {
  it("creates evidence cards from confirmed annotations", () => {
    const service = new EvidenceService({
      idFactory: () => "ev-1",
      now: () => new Date("2026-01-01T00:00:00.000Z"),
    });

    const card = service.fromAnnotation({
      annotation: {
        id: "ann-1",
        paperId: "paper-1",
        type: "evidence",
        pageIndex: 2,
        rectsPdfSpace: [],
        text: "The intervention improved the primary outcome.",
        linkedReviewQuestionId: "rq-1",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      evidenceType: "result",
      confidence: "high",
    });

    expect(card.id).toBe("ev-1");
    expect(card.quote).toContain("intervention improved");
    expect(card.linkedReviewQuestionId).toBe("rq-1");
    expect(card.confidence).toBe("high");
  });
});
