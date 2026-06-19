import type { Context } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import { HttpError } from "../../domain/errors";
import type { ApiError } from "../../domain/types";

export function errorHandler(
  error: Error,
  context: Context<{ Bindings: Env }>,
) {
  if (error instanceof HttpError) {
    return context.json<ApiError>(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      error.status as StatusCode,
    );
  }

  console.error(error);
  return context.json<ApiError>(
    {
      error: {
        code: "internal_error",
        message: "Ocurrio un error inesperado.",
      },
    },
    500,
  );
}

export function notFoundHandler(context: Context<{ Bindings: Env }>) {
  return context.json<ApiError>(
    {
      error: {
        code: "not_found",
        message: "Ruta no encontrada.",
      },
    },
    404,
  );
}
