import { createApp } from './app';
import { Logger } from './utils/logger';

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  const app = await createApp();
  app.listen(PORT, () => {
    Logger.info(`[Server] Listening on port ${PORT}`);
  });
};

startServer();
