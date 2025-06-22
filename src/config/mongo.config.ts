import mongoose from 'mongoose';
import { Logger } from '../utils/logger';

const connectMongo = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    Logger.info('[MongoDB] Connected successfully');
  } catch (err: any) {
    Logger.error('[MongoDB] Connection error: ' + err.message);
    process.exit(1);
  }
};

export default connectMongo;
