import 'dotenv/config';
import { connectDB } from './config/db.js';
import { clearBusinessData } from './utils/clearBusinessData.js';

async function clearData() {
  await connectDB();
  await clearBusinessData();
  console.log('Cleared all demo/app data. Admin login user was kept.');
  process.exit(0);
}

clearData().catch((error) => {
  console.error(error);
  process.exit(1);
});
