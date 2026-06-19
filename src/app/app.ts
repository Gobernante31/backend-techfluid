import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  errorHandler,
  notFoundHandler,
} from "../shared/middleware/error-handler";
import { verificationRoutes } from "../modules/verification/routes/verification.routes";

const app = new Hono<{ Bindings: Env }>();

// Build an allowlist from env var `ALLOWED_ORIGINS` if provided, otherwise use safe defaults for local dev.
const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];

const allowedOrigins = (() => {
  try {
    const raw = process.env.ALLOWED_ORIGINS;
    if (!raw) return DEFAULT_ORIGINS;
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  } catch (e) {
    return DEFAULT_ORIGINS;
  }
})();

app.use(
  "*",
  cors({
    // Accept only requests whose Origin header matches the allowlist
    origin: (origin) => {
      if (!origin) return false; // block requests without origin header by default
      return allowedOrigins.includes(origin);
    },
    allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.onError(errorHandler);
app.notFound(notFoundHandler);

app.get("/health", (context) =>
  context.json({
    ok: true,
    service: "techfluid-kyc-api",
    storage: context.env.DB ? "d1" : "memory",
  }),
);

app.route("/verification", verificationRoutes);

export default app;
