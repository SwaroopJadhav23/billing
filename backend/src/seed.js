import 'dotenv/config';
import { connectDB } from './config/db.js';
import { PERMISSIONS, ROLE_LABELS, ROLES } from './config/roles.js';
import { MenuCategory } from './models/MenuCategory.js';
import { MenuItem } from './models/MenuItem.js';
import { Restaurant } from './models/Restaurant.js';
import { Role } from './models/Role.js';
import { Table } from './models/Table.js';
import { User } from './models/User.js';

const categories = ['Starters', 'Main Course', 'Beverages', 'Desserts'];

const menuItems = [
  { name: 'Paneer Tikka', categoryName: 'Starters', description: 'Char-grilled paneer with spices', price: 220, gstPercentage: 5 },
  { name: 'Veg Spring Roll', categoryName: 'Starters', description: 'Crispy vegetable rolls', price: 160, gstPercentage: 5 },
  { name: 'Butter Paneer Masala', categoryName: 'Main Course', description: 'Rich tomato cashew gravy', price: 280, gstPercentage: 5 },
  { name: 'Dal Tadka', categoryName: 'Main Course', description: 'Yellow dal with tempered spices', price: 180, gstPercentage: 5 },
  { name: 'Masala Chai', categoryName: 'Beverages', description: 'Classic Indian tea', price: 40, gstPercentage: 5 },
  { name: 'Cold Coffee', categoryName: 'Beverages', description: 'Creamy chilled coffee', price: 120, gstPercentage: 5 },
  { name: 'Gulab Jamun', categoryName: 'Desserts', description: 'Warm syrup dumplings', price: 90, gstPercentage: 5 },
  { name: 'Brownie Sundae', categoryName: 'Desserts', description: 'Brownie with vanilla ice cream', price: 170, gstPercentage: 5 }
];

async function seed() {
  await connectDB();

  await Restaurant.updateOne(
    { name: process.env.RESTAURANT_NAME || 'Restaurant POS' },
    { name: process.env.RESTAURANT_NAME || 'Restaurant POS', address: 'Main Market, City', gstNumber: 'GSTIN123456789' },
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
    admin.status = 'active';
    await admin.save();
  } else {
    await User.create({
      name: 'Super Admin',
      email: adminEmail,
      mobile: '9999999999',
      password: adminPassword,
      role: ROLES.SUPER_ADMIN,
      status: 'active'
    });
  }

  await Promise.all(categories.map((name) => MenuCategory.updateOne({ name }, { name, status: 'active' }, { upsert: true })));
  await Promise.all(menuItems.map((item) => MenuItem.updateOne({ name: item.name }, { ...item, isAvailable: true, status: 'active' }, { upsert: true })));
  await Promise.all(Array.from({ length: 12 }, (_, index) => Table.updateOne(
    { name: `T-${index + 1}` },
    { name: `T-${index + 1}`, capacity: index % 3 === 0 ? 6 : 4, floor: 'Main', status: 'available' },
    { upsert: true }
  )));

  console.log('Seed complete');
  console.log(`Login: ${adminEmail} / ${adminPassword}`);
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
