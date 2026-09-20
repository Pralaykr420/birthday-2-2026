import { Router, type IRouter } from 'express';

import { getStore } from '../lib/store';

const router: IRouter = Router();

/**
 * Is the server alive, and can it save things?
 *
 * Hosting services ping this to decide whether to restart the app, and you
 * can open it in a browser to check everything is wired up correctly.
 */
router.get('/healthz', async (_request, response) => {
  const store = await getStore();
  response.json({
    status: 'ok',
    storage: store.mode,
    time: new Date().toISOString(),
  });
});

export default router;
