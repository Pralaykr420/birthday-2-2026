import { z } from 'zod';

/**
 * What the server will accept from the browser.
 *
 * Never trust what arrives over the network - not because she would attack
 * her own birthday present, but because a bug in the app, a stray bot, or a
 * half-sent request from a dying connection can all send nonsense. Checking
 * shapes here means a bad request gets a tidy 400 rather than crashing the
 * server at midnight.
 */

export const wishInput = z.object({
  text: z.string().trim().min(1, 'A wish cannot be empty').max(2000),
});

export const noteInput = z.object({
  text: z.string().trim().min(1, 'A note cannot be empty').max(5000),
  mood: z.string().trim().max(40).optional(),
});

export const quizResultInput = z.object({
  correct: z.number().int().min(0).max(100),
  total: z.number().int().min(1).max(100),
  answers: z.array(z.number().int().min(-1).max(20)).max(100).default([]),
});

export const reactionInput = z.object({
  kind: z.enum(['heart', 'hug', 'kiss', 'compliment', 'reason']),
  target: z.string().trim().max(120).optional(),
});

export const visitInput = z.object({
  screen: z.string().trim().min(1).max(40),
});

export type WishInput = z.infer<typeof wishInput>;
export type NoteInput = z.infer<typeof noteInput>;
export type QuizResultInput = z.infer<typeof quizResultInput>;
export type ReactionInput = z.infer<typeof reactionInput>;
export type VisitInput = z.infer<typeof visitInput>;
