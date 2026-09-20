import { Router, type IRouter } from 'express';

import adminRouter from './admin';
import healthRouter from './health';
import notesRouter from './notes';
import quizRouter from './quiz';
import reactionsRouter from './reactions';
import wishesRouter from './wishes';

/**
 * Every route in the app, gathered in one place.
 *
 * These all sit under /api, so `/wishes` below is really `/api/wishes`.
 * That prefix is added in app.ts.
 */
const router: IRouter = Router();

router.use(healthRouter);
router.use(wishesRouter);
router.use(notesRouter);
router.use(quizRouter);
router.use(reactionsRouter);
router.use(adminRouter);

export default router;
