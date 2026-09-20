import { Router, type IRouter } from 'express';

import { validate } from '../middlewares/validate';
import { getStore } from '../lib/store';
import { reactionInput, visitInput } from '../schemas';

const router: IRouter = Router();

/** A heart, a hug, a kiss, a compliment. */
router.post('/reactions', validate(reactionInput), async (request, response) => {
  const store = await getStore();
  await store.addReaction(request.body.kind, request.body.target ?? null);
  response.status(204).end();
});

/**
 * The running totals, which the app shows her.
 *
 * Not behind the admin password on purpose - these are counts, not messages,
 * and she is meant to see her hug count go up.
 */
router.get('/reactions/totals', async (_request, response) => {
  const store = await getStore();
  const totals = await store.reactionTotals();

  response.json({
    heart: totals.heart ?? 0,
    hug: totals.hug ?? 0,
    kiss: totals.kiss ?? 0,
  });
});

/** She opened a room. */
router.post('/visits', validate(visitInput), async (request, response) => {
  const store = await getStore();
  await store.recordVisit(request.body.screen);
  response.status(204).end();
});

export default router;
