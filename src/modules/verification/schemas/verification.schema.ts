import { HttpError } from "../../../domain/errors";
import type {
  CreateValidationInput,
  ValidationStatus,
} from "../../../domain/types";
import {
  DATA_IMAGE_PATTERN,
  EMAIL_PATTERN,
  VALIDATION_STATUSES,
} from "../../../domain/constants";

const statuses = new Set<string>(VALIDATION_STATUSES as readonly string[]);

export async function parseJsonBody<T>(request: Request): Promise<T> {
  try {
    return await request.json();
  } catch {
    throw new HttpError(
      400,
      "invalid_json",
      "El cuerpo de la peticion debe ser JSON valido.",
    );
  }
}

export function validateCreateValidation(
  input: Partial<CreateValidationInput>,
): CreateValidationInput {
  const details: Record<string, string> = {};
  const name = normalize(input.name);
  const email = normalize(input.email).toLowerCase();
  const documentNumber = normalize(input.documentNumber);
  const selfieImage = normalize(input.selfieImage);
  const documentImage = normalize(input.documentImage);

  if (name.length < 2)
    details.name = "El nombre debe tener al menos 2 caracteres.";
  if (!EMAIL_PATTERN.test(email))
    details.email = "El email no tiene un formato valido.";
  if (documentNumber.length < 3)
    details.documentNumber =
      "El numero de documento debe tener al menos 3 caracteres.";
  if (!DATA_IMAGE_PATTERN.test(selfieImage))
    details.selfieImage =
      "La selfie debe ser una imagen PNG, JPG o WEBP en base64.";
  if (!DATA_IMAGE_PATTERN.test(documentImage))
    details.documentImage =
      "El documento debe ser una imagen PNG, JPG o WEBP en base64.";
  if (selfieImage.length > 2_500_000)
    details.selfieImage = "La selfie no debe superar aproximadamente 2 MB.";
  if (documentImage.length > 2_500_000)
    details.documentImage =
      "La foto del documento no debe superar aproximadamente 2 MB.";

  if (Object.keys(details).length > 0) {
    throw new HttpError(
      422,
      "validation_error",
      "Hay campos invalidos en la solicitud.",
      details,
    );
  }

  return { name, email, documentNumber, selfieImage, documentImage };
}

export function validateStatus(input: unknown): ValidationStatus {
  const status = typeof input === "string" ? input : "";
  if (!statuses.has(status)) {
    throw new HttpError(
      422,
      "validation_error",
      "El estado debe ser pending, approved o rejected.",
      {
        status: "Estado invalido.",
      },
    );
  }

  return status as ValidationStatus;
}

function normalize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
