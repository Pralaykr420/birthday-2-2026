import { Router, type IRouter } from 'express';

import { requireAdmin } from '../middlewares/admin-auth';
import { validate } from '../middlewares/validate';
import { getStore } from '../lib/store';
import { noteInput } from '../schemas';

const router: IRouter = Router();

/** She wrote you a message. */
router.post('/notes', validate(noteInput), async (request, response) => {
  const store = await getStore();
  const note = await store.addNote(request.body.text, request.body.mood ?? null);
  response.status(201).json(note);
});

router.get('/notes', requireAdmin, async (_request, response) => {
  const store = await getStore();
  response.json(await store.listNotes());
});

export default router;
