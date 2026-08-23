import { z } from "zod";

export function jsonError(error: string, status: number, extra?: Record<string, unknown>) {
  return Response.json({ error, ...extra }, { status });
}

export function zodErrorResponse(error: z.ZodError) {
  return jsonError("Validation failed", 400, { issues: error.issues });
}
