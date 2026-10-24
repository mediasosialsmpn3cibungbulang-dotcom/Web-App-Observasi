import { z } from "zod";

/**
 * Format standar galat respons API
 */
export const ApiErrorCodeSchema = z.enum([
  "VALIDATION_FAILED", // 422
  "UNAUTHENTICATED",   // 401
  "FORBIDDEN",         // 403
  "NOT_FOUND",         // 404
  "VERSION_CONFLICT",   // 409
  "LOCKED",            // 423
  "RATE_LIMITED",      // 429
  "INTERNAL",          // 500
]);
export type ApiErrorCode = z.infer<typeof ApiErrorCodeSchema>;

export const ApiErrorResponseSchema = z.object({
  error: z.object({
    code: ApiErrorCodeSchema,
    message: z.string(),
    fieldErrors: z.record(z.array(z.string())).optional(),
    requestId: z.string(),
  }),
});
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

/**
 * Format standar pagination berbasis cursor
 */
export const PaginationParamsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    next_cursor: z.string().nullable(),
    has_more: z.boolean(),
    total: z.number().int().nonnegative().optional(),
  });
}
