import express from 'express';
import dotenv from 'dotenv';
import connectMongo from './config/mongo.config';
import securityGroupRoutes from './routes/security-group.routes';
import { errorMiddleware } from './middleware/error.middleware';

dotenv.config();
const app = express();
app.use(express.json());

connectMongo();

app.use('/api/security-groups', securityGroupRoutes);
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[Server] Listening on port ${PORT}`));
