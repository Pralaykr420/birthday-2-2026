import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

/**
 * Check the body of a request against a schema before the route runs.
 *
 * Use it like this:
 *   router.post('/wishes', validate(wishInput), (req, res) => { ... });
 *
 * By the time your route runs, `req.body` is guaranteed to be the right
 * shape, so the route itself contains no checking at all - just the thing it
 * is actually for.
 */
export function validate(schema: ZodSchema) {
  return (request: Request, response: Response, next: NextFunction) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      response.status(400).json({
        error: 'That request did not look right.',
        details: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
      return;
    }

    // Replace the raw body with the cleaned-up, trimmed version.
    request.body = result.data;
    next();
  };
}
