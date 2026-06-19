import type { Context } from "hono";
import { HttpError } from "../../../domain/errors";
import {
  parseJsonBody,
  validateCreateValidation,
  validateStatus,
} from "../schemas/verification.schema";
import type { CreateValidationInput } from "../../../domain/types";
import { VerificationService } from "../services/verification.service";

type AppContext = Context<{ Bindings: Env }>;

export class VerificationController {
  static async createVerification(context: AppContext) {
    const payload = await parseJsonBody<Partial<CreateValidationInput>>(
      context.req.raw,
    );
    const input = validateCreateValidation(payload);
    const service = new VerificationService(context.env);
    const validation = await service.create(input);

    return context.json(validation, 201);
  }

  static async listVerifications(context: AppContext) {
    const service = new VerificationService(context.env);
    const validations = await service.list();

    return context.json({ data: validations });
  }

  static async findVerification(context: AppContext) {
    const service = new VerificationService(context.env);
    const validation = await service.findById(context.req.param("id"));

    if (!validation) {
      throw new HttpError(
        404,
        "validation_not_found",
        "No existe una validacion con ese id.",
      );
    }

    return context.json(validation);
  }

  static async updateVerificationStatus(context: AppContext) {
    const payload = await parseJsonBody<{ status?: unknown }>(context.req.raw);
    const status = validateStatus(payload.status);
    const service = new VerificationService(context.env);
    const validation = await service.updateStatus(
      context.req.param("id"),
      status,
    );

    if (!validation) {
      throw new HttpError(
        404,
        "validation_not_found",
        "No existe una validacion con ese id.",
      );
    }

    return context.json(validation);
  }

  // Dev-only: seed sample validations with different statuses
  static async seedVerifications(context: AppContext) {
    // Enabled only when ALLOW_SEED=true is set in env
    // Allow seed when either environment variable or Worker env var is set
    const allowEnv =
      (process.env.ALLOW_SEED || "false").toLowerCase() === "true";
    const allowBinding = (context.env as any).ALLOW_SEED === "true";
    if (!(allowEnv || allowBinding)) {
      throw new HttpError(
        403,
        "forbidden",
        "Seeding is disabled in this environment.",
      );
    }

    const service = new VerificationService(context.env);

    const samples = [
      {
        name: "Alice Demo",
        email: "alice@example.com",
        documentNumber: "A1234567",
        selfieImage:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...",
        documentImage:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...",
      },
      {
        name: "Bob Demo",
        email: "bob@example.com",
        documentNumber: "B7654321",
        selfieImage:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...",
        documentImage:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...",
      },
      {
        name: "Carol Demo",
        email: "carol@example.com",
        documentNumber: "C0000000",
        selfieImage:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...",
        documentImage:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...",
      },
    ];

    const created = [] as any[];
    for (let i = 0; i < samples.length; i++) {
      const s = samples[i];
      const v = await service.create(s as any);
      // Update statuses: pending, approved, rejected
      const statuses = ["pending", "approved", "rejected"] as const;
      const target = statuses[i] ?? "pending";
      const updated = await service.updateStatus(v.id, target);
      created.push(updated);
    }

    return context.json({ data: created });
  }
}
