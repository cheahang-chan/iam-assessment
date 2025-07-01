import 'express-async-errors';
import express from 'express';
import dotenv from 'dotenv';
import helmet from "helmet";
import connectMongo from './config/mongo.config';
import securityGroupRoutes from './routes/security-group.routes';
import { errorMiddleware } from './middleware/error.middleware';
import { correlationMiddleware } from './middleware/correlation.middleware';
import initSwagger from './config/swagger.config';
import { success } from './utils/response';

dotenv.config();

export const createApp = async () => {
    await connectMongo();

    const app = express();

    app.use(helmet());
    app.use(correlationMiddleware);
    app.use(express.json());

    initSwagger(app);

    app.get('/', (req, res) => { return success(res, "Ok") });
    app.get('/healthz', (req, res) => { return success(res, "Ok") });

    app.use('/api/v1/security-groups', securityGroupRoutes);
    app.use(errorMiddleware);

    return app;
};

export default createApp;
