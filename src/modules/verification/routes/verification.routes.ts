import { Hono } from "hono";
import { VerificationController } from "../controller/verification.controller";

export const verificationRoutes = new Hono<{ Bindings: Env }>();

verificationRoutes.post("/", VerificationController.createVerification);
verificationRoutes.get("/", VerificationController.listVerifications);
verificationRoutes.get("/:id", VerificationController.findVerification);
verificationRoutes.patch(
  "/:id/status",
  VerificationController.updateVerificationStatus,
);

// Dev-only seed route: set ALLOW_SEED=true in env to enable
verificationRoutes.post("/seed", VerificationController.seedVerifications);
