import type { NewReviewAnnotation, ReviewAnnotation } from "./types.js";

export interface AnnotationStore {
  create(input: NewReviewAnnotation): Promise<ReviewAnnotation>;
  update(id: string, patch: Partial<Omit<ReviewAnnotation, "id" | "createdAt">>): Promise<ReviewAnnotation>;
  delete(id: string): Promise<void>;
  listByPaper(paperId: string): Promise<ReviewAnnotation[]>;
  get(id: string): Promise<ReviewAnnotation | null>;
}

export interface AnnotationStoreOptions {
  idFactory?: () => string;
  now?: () => Date;
}

export class InMemoryAnnotationStore implements AnnotationStore {
  private readonly annotations = new Map<string, ReviewAnnotation>();
  private readonly idFactory: () => string;
  private readonly now: () => Date;

  constructor(options: AnnotationStoreOptions = {}) {
    this.idFactory = options.idFactory ?? (() => crypto.randomUUID());
    this.now = options.now ?? (() => new Date());
  }

  async create(input: NewReviewAnnotation): Promise<ReviewAnnotation> {
    const id = this.idFactory();
    const createdAt = this.now().toISOString();
    const annotation: ReviewAnnotation = {
      id,
      createdAt,
      ...input,
    };
    this.annotations.set(id, annotation);
    return annotation;
  }

  async update(id: string, patch: Partial<Omit<ReviewAnnotation, "id" | "createdAt">>): Promise<ReviewAnnotation> {
    const current = this.annotations.get(id);
    if (!current) {
      throw new Error(`Annotation not found: ${id}`);
    }
    const next: ReviewAnnotation = {
      ...current,
      ...patch,
      updatedAt: this.now().toISOString(),
    };
    this.annotations.set(id, next);
    return next;
  }

  async delete(id: string): Promise<void> {
    this.annotations.delete(id);
  }

  async listByPaper(paperId: string): Promise<ReviewAnnotation[]> {
    return Array.from(this.annotations.values()).filter(annotation => annotation.paperId === paperId);
  }

  async get(id: string): Promise<ReviewAnnotation | null> {
    return this.annotations.get(id) ?? null;
  }
}
