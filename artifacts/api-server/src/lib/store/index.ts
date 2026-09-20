import { connectToMongo } from '@workspace/db';

import { env } from '../env';
import { logger } from '../logger';
import { FileStore } from './file-store';
import { MongoStore } from './mongo-store';
import type { Store } from './types';

export type { Store } from './types';

let store: Store | null = null;

/**
 * Work out where to save things, connect to it, and hand it back.
 *
 * MongoDB if MONGODB_URI is set, otherwise a JSON file on disk. If Mongo is
 * configured but unreachable, we fall back to the file rather than refusing
 * to start - on her birthday, a server that runs in a degraded way is much
 * better than a server that does not run.
 *
 * The result is remembered, so the connection is made once and then reused
 * by every request rather than reconnecting each time.
 */
export async function getStore(): Promise<Store> {
  if (store) return store;

  if (env.mongoUri) {
    const connected = await connectToMongo(env.mongoUri);

    if (connected) {
      const mongoStore = new MongoStore();
      try {
        await mongoStore.setup();
        logger.info('Saving to MongoDB');
        store = mongoStore;
        return store;
      } catch (error) {
        logger.error({ error }, 'Connected to Mongo but could not prepare it');
      }
    } else {
      logger.error('Could not reach MongoDB, falling back to a file');
    }
  }

  const fileStore = new FileStore(env.dataFile);
  await fileStore.setup();
  logger.info({ path: env.dataFile }, 'Saving to a local file');
  store = fileStore;
  return store;
}
