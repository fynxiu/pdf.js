import { describe, expect, it } from "vitest";
import { InMemoryAnnotationStore } from "../src/annotation_store.js";

describe("InMemoryAnnotationStore", () => {
  it("creates, lists, updates, and deletes annotations", async () => {
    const store = new InMemoryAnnotationStore({
      idFactory: () => "ann-1",
      now: () => new Date("2026-01-01T00:00:00.000Z"),
    });

    const created = await store.create({
      paperId: "paper-1",
      type: "highlight",
      pageIndex: 0,
      rectsPdfSpace: [{ x: 1, y: 2, width: 3, height: 4 }],
      text: "Important finding.",
    });

    expect(created.id).toBe("ann-1");
    expect(await store.listByPaper("paper-1")).toHaveLength(1);

    const updated = await store.update("ann-1", { note: "Reviewed" });
    expect(updated.note).toBe("Reviewed");

    await store.delete("ann-1");
    expect(await store.get("ann-1")).toBeNull();
  });
});
