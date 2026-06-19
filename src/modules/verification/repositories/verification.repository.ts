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
  // Accept the Worker Env so we can access D1 and R2 bindings
  constructor(private readonly env?: Env) {}

  async create(input: CreateValidationInput): Promise<KycValidation> {
    const now = new Date().toISOString();
    const validation: KycValidation = {
      id: crypto.randomUUID(),
      ...input,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    const database = (this.env as any)?.DB as D1Database | undefined;

    // If R2 binding `IMAGES` exists, store images there and replace base64 with keys
    if (this.env && (this.env as any).IMAGES) {
      try {
        const r2 = (this.env as any).IMAGES as R2Bucket;
        // selfie
        if (
          validation.selfieImage &&
          validation.selfieImage.startsWith("data:")
        ) {
          const s = parseDataUrl(validation.selfieImage);
          if (s) {
            const key = `${validation.id}-selfie`;
            await r2.put(key, s.buffer, {
              httpMetadata: { contentType: s.contentType },
            });
            validation.selfieImage = key;
          }
        }
        // document
        if (
          validation.documentImage &&
          validation.documentImage.startsWith("data:")
        ) {
          const s = parseDataUrl(validation.documentImage);
          if (s) {
            const key = `${validation.id}-document`;
            await r2.put(key, s.buffer, {
              httpMetadata: { contentType: s.contentType },
            });
            validation.documentImage = key;
          }
        }
      } catch (e) {
        // swallow R2 errors and fallback to storing base64
        console.error("R2 put failed", e);
      }
    }

    if (database) {
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
    if (database) {
      const result = await database
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
    if (database) {
      const row = await database
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

    if (database) {
      await database
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
    // If stored as R2 key, expose a local proxy path `/images/:key` to retrieve it
    selfieImage: row.selfie_image
      ? `/images/${row.selfie_image}`
      : row.selfie_image,
    documentImage: row.document_image
      ? `/images/${row.document_image}`
      : row.document_image,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseDataUrl(
  dataUrl: string,
): { contentType: string; buffer: Uint8Array } | null {
  const m = dataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!m) return null;
  const contentType = m[1];
  const b64 = m[2];
  let buffer: Uint8Array;
  if (typeof Buffer !== "undefined") {
    buffer = Buffer.from(b64, "base64");
  } else {
    const binary = atob(b64);
    const len = binary.length;
    buffer = new Uint8Array(len);
    for (let i = 0; i < len; i++) buffer[i] = binary.charCodeAt(i);
  }
  return { contentType, buffer };
}
