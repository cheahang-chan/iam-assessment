import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { Logger } from '../utils/logger';
import swaggerDocument from '../../openapi/openapi.json';

const initSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve as any, swaggerUi.setup(swaggerDocument) as any);
  Logger.info('Swagger docs available at /api-docs');
};

export default initSwagger;
