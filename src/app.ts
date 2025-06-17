import 'express-async-errors';
import express from 'express';
import dotenv from 'dotenv';
import helmet from "helmet";
import connectMongo from './config/mongo.config';
import securityGroupRoutes from './routes/security-group.routes';
import { errorMiddleware } from './middleware/error.middleware';
import { correlationMiddleware } from './middleware/correlation.middleware';
import { Logger } from './utils/logger';
import initSwagger from './config/swagger.config';

dotenv.config();

const app = express();

app.use(helmet());
app.use(correlationMiddleware);
app.use(express.json());

initSwagger(app);
connectMongo();

app.use('/api/v1/security-groups', securityGroupRoutes);
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => Logger.info(`[Server] Listening on port ${PORT}`));
