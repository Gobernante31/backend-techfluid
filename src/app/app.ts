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
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
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

// Serve R2 images via a proxy route when R2 binding `IMAGES` exists.
app.get("/images/:key", async (c) => {
  const key = c.req.param("key");
  const bucket = (c.env as any).IMAGES as R2Bucket | undefined;
  if (!bucket) return c.text("Not found", 404);

  const obj = await bucket.get(key);
  if (!obj) return c.text("Not found", 404);

  const array = await obj.arrayBuffer();
  const headers: Record<string, string> = {};
  if (obj.httpMetadata && (obj.httpMetadata as any).contentType) {
    headers["Content-Type"] = (obj.httpMetadata as any).contentType;
  } else {
    headers["Content-Type"] = "application/octet-stream";
  }

  return new Response(array, { headers });
});

export default app;
