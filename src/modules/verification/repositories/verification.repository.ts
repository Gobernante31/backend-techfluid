import type {
  CreateValidationInput,
  KycValidation,
  ValidationStatus,
} from "../../../domain/types";

type D1Row = {
  id: string;
  name: string;
  email: string;
  document_number: string;
  selfie_image: string;
  document_image: string;
  status: ValidationStatus;
  created_at: string;
  updated_at: string;
};

const memoryStore = new Map<string, KycValidation>();

export class VerificationRepository {
  constructor(private readonly database?: D1Database) {}

  async create(input: CreateValidationInput): Promise<KycValidation> {
    const now = new Date().toISOString();
    const validation: KycValidation = {
      id: crypto.randomUUID(),
      ...input,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    if (this.database) {
      await this.database
        .prepare(
          `INSERT INTO validations
            (id, name, email, document_number, selfie_image, document_image, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          validation.id,
          validation.name,
          validation.email,
          validation.documentNumber,
          validation.selfieImage,
          validation.documentImage,
          validation.status,
          validation.createdAt,
          validation.updatedAt,
        )
        .run();
    } else {
      memoryStore.set(validation.id, validation);
    }

    return validation;
  }

  async list(): Promise<KycValidation[]> {
    if (this.database) {
      const result = await this.database
        .prepare("SELECT * FROM validations ORDER BY created_at DESC")
        .all<D1Row>();

      return result.results.map(mapRow);
    }

    return Array.from(memoryStore.values()).sort(
      (firstValidation, secondValidation) =>
        secondValidation.createdAt.localeCompare(firstValidation.createdAt),
    );
  }

  async findById(id: string): Promise<KycValidation | null> {
    if (this.database) {
      const row = await this.database
        .prepare("SELECT * FROM validations WHERE id = ?")
        .bind(id)
        .first<D1Row>();
      return row ? mapRow(row) : null;
    }

    return memoryStore.get(id) ?? null;
  }

  async updateStatus(
    id: string,
    status: ValidationStatus,
  ): Promise<KycValidation | null> {
    const current = await this.findById(id);
    if (!current) return null;

    const updated: KycValidation = {
      ...current,
      status,
      updatedAt: new Date().toISOString(),
    };

    if (this.database) {
      await this.database
        .prepare(
          "UPDATE validations SET status = ?, updated_at = ? WHERE id = ?",
        )
        .bind(updated.status, updated.updatedAt, updated.id)
        .run();
    } else {
      memoryStore.set(updated.id, updated);
    }

    return updated;
  }
}

export function clearMemoryStore() {
  memoryStore.clear();
}

function mapRow(row: D1Row): KycValidation {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    documentNumber: row.document_number,
    selfieImage: row.selfie_image,
    documentImage: row.document_image,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
