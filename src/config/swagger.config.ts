import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { Logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';

const swaggerJsonPath = path.join(__dirname, '../../openapi/openapi.json');
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerJsonPath, 'utf8'));

const initSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve as any, swaggerUi.setup(swaggerDocument) as any);
  Logger.info('Swagger docs available at /api-docs');
};

export default initSwagger;
