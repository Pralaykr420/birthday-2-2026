import { Router, type IRouter } from 'express';

import { requireAdmin } from '../middlewares/admin-auth';
import { getStore } from '../lib/store';

const router: IRouter = Router();

/**
 * Everything at once, for your private inbox page.
 *
 * One request rather than six, because the admin screen shows all of it
 * together and six round trips on a phone is five too many.
 */
router.get('/admin/everything', requireAdmin, async (_request, response) => {
  const store = await getStore();

  // Run all six queries at the same time instead of one after another.
  const [wishes, notes, quizResults, reactionTotals, visits] = await Promise.all([
    store.listWishes(),
    store.listNotes(),
    store.listQuizResults(),
    store.reactionTotals(),
    store.listVisits(),
  ]);

  response.json({
    wishes,
    notes,
    quizResults,
    reactionTotals,
    visits,
    storageMode: store.mode,
  });
});

export default router;
