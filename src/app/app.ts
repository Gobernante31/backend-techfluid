import { Hono } from "hono";
import { cors } from "hono/cors";

import {
  errorHandler,
  notFoundHandler,
} from "../shared/middleware/error-handler";

import { verificationRoutes } from "../modules/verification/routes/verification.routes";

const app = new Hono<{ Bindings: Env }>();

const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];

app.use("*", async (context, next) => {
  const rawOrigins = context.env.ALLOWED_ORIGINS;

  const allowedOrigins = rawOrigins
    ? rawOrigins
        .split(",")
        .map((origin: string) => origin.trim())
        .filter(Boolean)
    : DEFAULT_ORIGINS;

  return cors({
    origin: (origin) => (allowedOrigins.includes(origin) ? origin : undefined),
    allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })(context, next);
});

app.onError(errorHandler);
app.notFound(notFoundHandler);

app.get("/health", (context) =>
  context.json({
    ok: true,
    service: "techfluid-kyc-api",
    storage: context.env.DB ? "d1" : "memory",
    environment: context.env.APP_ENV,
  }),
);

app.route("/verification", verificationRoutes);

export default app;
