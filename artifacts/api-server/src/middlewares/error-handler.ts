import type { NextFunction, Request, Response } from 'express';

import { env } from '../lib/env';
import { logger } from '../lib/logger';

/** Anything that does not match a route gets a clear 404 rather than HTML. */
export function notFound(request: Request, response: Response) {
  response.status(404).json({ error: `No route for ${request.method} ${request.path}` });
}

/**
 * The last line of defence.
 *
 * Express sends any error thrown in a route here. Without it, a single
 * unexpected error would return a page of stack trace to the browser, which
 * is both ugly and a security problem.
 *
 * Note the unused `_next` parameter. It looks pointless, but Express decides
 * a function is an error handler by counting its arguments, so removing it
 * silently stops this working.
 */
export function errorHandler(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  logger.error({ error }, 'Unhandled error in a route');

  response.status(500).json({
    error: 'Something went wrong on our side.',
    // Only show the real message while developing. In production it could
    // reveal file paths or database details.
    detail: env.isProduction ? undefined : error.message,
  });
}
