import mongoose from 'mongoose';

const connectMongo = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('[MongoDB] Connected successfully');
  } catch (err: any) {
    console.error('[MongoDB] Connection error:', err.message);
    process.exit(1);
  }
};

export default connectMongo;
