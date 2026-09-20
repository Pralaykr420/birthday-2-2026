import cors from 'cors';
import express, { type Express } from 'express';
import pinoHttp from 'pino-http';

import { env } from './lib/env';
import { logger } from './lib/logger';
import { errorHandler, notFound } from './middlewares/error-handler';
import { rateLimit } from './middlewares/rate-limit';
import router from './routes';

const app: Express = express();

/**
 * Trust the proxy in front of us.
 *
 * Hosting services (Render, Railway, Fly) sit a load balancer in front of
 * your app. Without this line, every request looks like it came from that
 * load balancer, so the rate limiter would see one visitor and throttle
 * everybody at once.
 */
app.set('trust proxy', 1);

/* ---- Logging ---------------------------------------------------- */
app.use(
  pinoHttp({
    logger,
    serializers: {
      req: (request) => ({ method: request.method, url: request.url?.split('?')[0] }),
      res: (response) => ({ statusCode: response.statusCode }),
    },
  }),
);

/* ---- Who is allowed to call us ----------------------------------
 * In development we allow anything, so you can open the app from your
 * laptop and from your phone on the same wifi without fiddling.
 * In production only the sites you list in ALLOWED_ORIGINS get through.
 */
app.use(
  cors({
    origin:
      env.allowedOrigins.length > 0
        ? env.allowedOrigins
        : env.isProduction
          ? false
          : true,
  }),
);

/* ---- Reading request bodies --------------------------------------
 * The limit is deliberately small. Nothing this app accepts is bigger than
 * a few paragraphs, so refusing anything larger costs us nothing and stops
 * somebody filling the server's memory with one request.
 */
app.use(express.json({ limit: '64kb' }));

/* ---- Throttling --------------------------------------------------
 * 240 requests per minute is generous for one person tapping buttons, and
 * low enough that a runaway loop cannot flatten a free hosting plan.
 */
app.use('/api', rateLimit({ max: 240, windowMs: 60_000 }));

/* ---- The actual routes ------------------------------------------- */
app.use('/api', router);

/* ---- Fallbacks ---------------------------------------------------
 * Order matters here. These must come last, after every real route, or
 * they would swallow the requests meant for those routes.
 */
app.use(notFound);
app.use(errorHandler);

export default app;
