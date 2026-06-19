import type { Context } from "hono";

import { HttpError } from "../../../domain/errors";
import type { CreateValidationInput } from "../../../domain/types";

import {
  parseJsonBody,
  validateCreateValidation,
  validateStatus,
} from "../schemas/verification.schema";

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

    return context.json({
      data: validations,
    });
  }

  static async findVerification(context: AppContext) {
    const service = new VerificationService(context.env);

    const validation = await service.findById(context.req.param("id"));

    if (!validation) {
      throw new HttpError(
        404,
        "validation_not_found",
        "No existe una validación con ese id.",
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
        "No existe una validación con ese id.",
      );
    }

    return context.json(validation);
  }

  static async seedVerifications(context: AppContext) {
    const allowSeed = context.env.ALLOW_SEED?.toLowerCase() === "true";

    if (!allowSeed) {
      throw new HttpError(
        403,
        "forbidden",
        "Seeding is disabled in this environment.",
      );
    }

    const service = new VerificationService(context.env);

    const samples: CreateValidationInput[] = [
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

    const statuses = ["pending", "approved", "rejected"] as const;

    const created = [];

    for (const [index, sample] of samples.entries()) {
      const validation = await service.create(sample);

      const updated = await service.updateStatus(
        validation.id,
        statuses[index] ?? "pending",
      );

      created.push(updated);
    }

    return context.json({
      data: created,
    });
  }
}
