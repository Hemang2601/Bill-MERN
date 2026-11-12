import mongoose from 'mongoose';
import { config } from './index.js';
import { logger } from '../utils/logger.js';

export async function connectDB(): Promise<typeof mongoose> {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });
    logger.info(`MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    logger.error({ err: error }, 'Failed to connect to MongoDB');
    throw error;
  }
}

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB connection lost. Reconnecting...');
});

mongoose.connection.on('error', (err) => {
  logger.error({ err }, 'MongoDB runtime error');
});
