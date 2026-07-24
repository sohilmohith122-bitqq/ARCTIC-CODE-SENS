import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/arctic-code-sens';

export async function connectDatabase() {
  try {
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected — reconnecting...');
      setTimeout(() => connectDatabase(), 3000);
    });
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err.message);
    });
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connected');
    });

    await mongoose.connect(MONGODB_URI, {
      retryWrites: true,
      w: 'majority',
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 60000,
      heartbeatFrequencyMS: 10000,
    });
    return true;
  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⏳ Retrying in 5 seconds...');
    setTimeout(() => connectDatabase(), 5000);
    return false;
  }
}

export default mongoose;
