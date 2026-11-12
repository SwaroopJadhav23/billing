import mongoose from 'mongoose';

let ready = false;

export function isDbReady() {
  return ready && mongoose.connection.readyState === 1;
}

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is required');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000
  });
  ready = true;
  console.log('MongoDB connected');
}

export async function connectDBWithRetry({ retries = 8, delayMs = 5000 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await connectDB();
      return;
    } catch (error) {
      ready = false;
      lastError = error;
      console.error(`MongoDB connect attempt ${attempt}/${retries} failed:`, error.message);
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
}
