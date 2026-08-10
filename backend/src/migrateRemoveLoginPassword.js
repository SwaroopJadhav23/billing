import 'dotenv/config';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';

/** One-time: strip legacy plaintext loginPassword fields from users */
async function migrate() {
  await connectDB();
  const result = await User.updateMany(
    { loginPassword: { $exists: true } },
    { $unset: { loginPassword: 1 } }
  );
  console.log(`Unset loginPassword on ${result.modifiedCount || result.nModified || 0} users`);
  process.exit(0);
}

migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});
