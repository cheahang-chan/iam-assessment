import 'express-async-errors';
import express from 'express';
import dotenv from 'dotenv';
import helmet from "helmet";
import connectMongo from './config/mongo.config';
import securityGroupRoutes from './routes/security-group.routes';
import { errorMiddleware } from './middleware/error.middleware';
import { correlationMiddleware } from './middleware/correlation.middleware';
import initSwagger from './config/swagger.config';

dotenv.config();

const app = express();

app.use(helmet());
app.use(correlationMiddleware);
app.use(express.json());

initSwagger(app);
connectMongo();

app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/api/v1/security-groups', securityGroupRoutes);
app.use(errorMiddleware);

export default app;
