import app from './app.js';
import { logger } from './lib/logger.js';
import { seedSuperAdmin } from './seed.js';

const rawPort = process.env['PORT'];

if (!rawPort) {
  throw new Error('PORT environment variable is required but was not provided.');
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Seed superadmin on first run (no-op if already exists)
seedSuperAdmin().then(() => {
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, 'Error listening on port');
      process.exit(1);
    }
    logger.info({ port }, 'Server listening');
  });
});
