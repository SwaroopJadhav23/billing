import 'dotenv/config';
import { connectDB } from './config/db.js';
import { PERMISSIONS, ROLE_LABELS, ROLES } from './config/roles.js';
import { Restaurant } from './models/Restaurant.js';
import { Role } from './models/Role.js';
import { User } from './models/User.js';

async function seed() {
  await connectDB();

  await Restaurant.updateOne(
    { name: process.env.RESTAURANT_NAME || 'Volmier Billing System' },
    { name: process.env.RESTAURANT_NAME || 'Volmier Billing System', address: '', gstNumber: '' },
    { upsert: true }
  );

  await Promise.all(Object.values(ROLES).map((role) => Role.updateOne(
    { name: role },
    { name: role, label: ROLE_LABELS[role], permissions: Object.keys(PERMISSIONS).filter((key) => PERMISSIONS[key].includes(role)) },
    { upsert: true }
  )));

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'swaroopjadhav6161@gmail.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || '123456';
  const admin = await User.findOne({ email: adminEmail }).select('+password');
  if (admin) {
    admin.name = 'Super Admin';
    admin.password = adminPassword;
    admin.role = ROLES.SUPER_ADMIN;
    admin.tenant = null;
    admin.status = 'active';
    await admin.save();
  } else {
    await User.create({
      name: 'Super Admin',
      email: adminEmail,
      mobile: '9999999999',
      password: adminPassword,
      role: ROLES.SUPER_ADMIN,
      tenant: null,
      status: 'active'
    });
  }

  console.log('Seed complete (admin + roles only, no sample menu/tables)');
  console.log(`Login: ${adminEmail} / ${adminPassword}`);
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
