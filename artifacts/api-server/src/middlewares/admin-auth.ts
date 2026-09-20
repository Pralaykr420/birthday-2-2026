import { timingSafeEqual } from 'node:crypto';

import type { NextFunction, Request, Response } from 'express';

import { env } from '../lib/env';

/**
 * Compare two strings without leaking how much of them matched.
 *
 * A normal === stops at the first different character, so a determined
 * attacker can measure the tiny timing differences and work the password out
 * one letter at a time. This always takes the same amount of time.
 */
function sameSecret(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Blocks anything except you from reading her messages.
 *
 * The password arrives in a header rather than the URL, because URLs get
 * written into server logs and browser history and the passwords in them go
 * with them.
 */
export function requireAdmin(request: Request, response: Response, next: NextFunction) {
  const given = request.header('x-admin-password');

  if (!given || !sameSecret(given, env.adminPassword)) {
    // Deliberately vague. Saying "wrong password" versus "no password"
    // tells an attacker more than they need to know.
    response.status(401).json({ error: 'Not allowed.' });
    return;
  }

  next();
}
