import pino from 'pino';

import { env } from './env';

/**
 * The server's logger.
 *
 * In development it prints readable, coloured lines. In production it prints
 * JSON, which is what hosting services expect so they can search your logs.
 */
export const logger = pino(
  env.isProduction
    ? { level: 'info' }
    : {
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
        },
      },
);
