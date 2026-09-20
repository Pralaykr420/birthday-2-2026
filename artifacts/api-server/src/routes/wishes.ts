import { Router, type IRouter } from 'express';

import { requireAdmin } from '../middlewares/admin-auth';
import { validate } from '../middlewares/validate';
import { getStore } from '../lib/store';
import { wishInput } from '../schemas';

const router: IRouter = Router();

/** She made a wish on the cake. */
router.post('/wishes', validate(wishInput), async (request, response) => {
  const store = await getStore();
  const wish = await store.addWish(request.body.text);
  response.status(201).json(wish);
});

/** Read them all. Only you. */
router.get('/wishes', requireAdmin, async (_request, response) => {
  const store = await getStore();
  response.json(await store.listWishes());
});

export default router;
