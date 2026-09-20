import { disconnectFromMongo } from '@workspace/db';

import app from './app';
import { env } from './lib/env';
import { logger } from './lib/logger';
import { getStore } from './lib/store';

/**
 * Start the server.
 *
 * We connect to storage BEFORE accepting any requests. Doing it lazily on the
 * first request would mean her very first wish is the one that waits for a
 * cold database connection, which is exactly the wrong request to make slow.
 */
async function start() {
  const store = await getStore();

  const server = app.listen(env.port, () => {
    logger.info(
      { port: env.port, storage: store.mode },
      'Server is listening',
    );
  });

  /**
   * Shut down tidily.
   *
   * When a hosting service redeploys, it sends SIGTERM and then waits a few
   * seconds before killing the process. Using that window to finish the
   * requests already in flight and close the database connection is the
   * difference between a clean restart and a lost message.
   */
  async function shutDown(signal: string) {
    logger.info({ signal }, 'Shutting down');

    server.close(async () => {
      await disconnectFromMongo().catch(() => {
        // Already closed, or we were never connected. Either is fine.
      });
      process.exit(0);
    });

    // If something refuses to let go after ten seconds, stop waiting.
    setTimeout(() => process.exit(1), 10_000).unref();
  }

  process.on('SIGTERM', () => void shutDown('SIGTERM'));
  process.on('SIGINT', () => void shutDown('SIGINT'));
}

start().catch((error) => {
  logger.error({ error }, 'Could not start the server');
  process.exit(1);
});
