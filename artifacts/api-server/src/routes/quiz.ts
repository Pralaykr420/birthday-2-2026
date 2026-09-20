import { Router, type IRouter } from 'express';

import { requireAdmin } from '../middlewares/admin-auth';
import { validate } from '../middlewares/validate';
import { getStore } from '../lib/store';
import { quizResultInput } from '../schemas';

const router: IRouter = Router();

/** She finished the quiz. */
router.post('/quiz-results', validate(quizResultInput), async (request, response) => {
  const store = await getStore();
  const result = await store.addQuizResult(
    request.body.correct,
    request.body.total,
    request.body.answers,
  );
  response.status(201).json(result);
});

router.get('/quiz-results', requireAdmin, async (_request, response) => {
  const store = await getStore();
  response.json(await store.listQuizResults());
});

export default router;
