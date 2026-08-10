import 'dotenv/config';
import { connectDB } from './config/db.js';
import { Customer } from './models/Customer.js';
import { Inventory } from './models/Inventory.js';
import { MenuCategory } from './models/MenuCategory.js';
import { MenuItem } from './models/MenuItem.js';
import { Restaurant } from './models/Restaurant.js';
import { Table } from './models/Table.js';
import { Tenant } from './models/Tenant.js';
import { User } from './models/User.js';
import { ROLES } from './config/roles.js';
import { clearBusinessData } from './utils/clearBusinessData.js';

const categories = ['Cakes', 'Breads', 'Cookies & Pastries', 'Beverages'];

const products = [
  { name: 'Chocolate Truffle Cake', categoryName: 'Cakes', description: '500g chocolate cake', price: 450, gstPercentage: 5 },
  { name: 'Butterscotch Cake', categoryName: 'Cakes', description: '500g butterscotch cake', price: 420, gstPercentage: 5 },
  { name: 'Cupcakes Pack of 4', categoryName: 'Cakes', description: 'Assorted cupcakes', price: 180, gstPercentage: 5 },
  { name: 'White Bread Loaf', categoryName: 'Breads', description: 'Soft sandwich bread', price: 40, gstPercentage: 5 },
  { name: 'Brown Bread Loaf', categoryName: 'Breads', description: 'Whole wheat bread', price: 50, gstPercentage: 5 },
  { name: 'Butter Croissant', categoryName: 'Cookies & Pastries', description: 'Flaky butter croissant', price: 60, gstPercentage: 5 },
  { name: 'Chocolate Cookie Box', categoryName: 'Cookies & Pastries', description: '8 cookies', price: 150, gstPercentage: 5 },
  { name: 'Veg Puff', categoryName: 'Cookies & Pastries', description: 'Fresh bakery puff', price: 25, gstPercentage: 5 },
  { name: 'Hot Coffee', categoryName: 'Beverages', description: 'Cafe style coffee', price: 80, gstPercentage: 5 },
  { name: 'Hot Chocolate', categoryName: 'Beverages', description: 'Rich cocoa drink', price: 100, gstPercentage: 5 }
];

async function seedBakery() {
  await connectDB();
  await clearBusinessData();

  const tenant = await Tenant.create({
    name: 'Volmier Bakery Store',
    businessType: 'bakery',
    ownerName: 'Bakery Admin',
    email: 'bakery@volmier.test',
    mobile: '9000000002',
    address: 'Bakery Lane, Demo City',
    gstNumber: '27BAKERY1234B1Z9',
    status: 'active'
  });

  await User.create({
    name: 'Bakery Admin',
    email: 'bakery@volmier.test',
    mobile: '9000000002',
    password: '123456',
    role: ROLES.MANAGER,
    tenant: tenant._id,
    status: 'active'
  });

  await Restaurant.create({
    tenant: tenant._id,
    name: tenant.name,
    address: tenant.address,
    gstNumber: tenant.gstNumber
  });

  await Promise.all(categories.map((name) => MenuCategory.create({ tenant: tenant._id, name, status: 'active' })));
  await Promise.all(products.map((item) => MenuItem.create({ ...item, tenant: tenant._id, isAvailable: true, status: 'active' })));
  await Promise.all([
    Table.create({ tenant: tenant._id, name: 'Counter-A', capacity: 1, floor: 'Bakery', status: 'available' }),
    Table.create({ tenant: tenant._id, name: 'Takeaway Desk', capacity: 1, floor: 'Bakery', status: 'available' })
  ]);
  await Promise.all([
    Customer.create({ tenant: tenant._id, name: 'Ananya Shah', mobile: '9812345678', address: 'Green Park' }),
    Customer.create({ tenant: tenant._id, name: 'Vikram Joshi', mobile: '9823456789', address: 'Bakery Lane' })
  ]);
  await Promise.all([
    Inventory.create({ tenant: tenant._id, materialName: 'Maida Flour', unit: 'kg', currentStock: 50, minimumStockLevel: 10, purchaseCost: 40 }),
    Inventory.create({ tenant: tenant._id, materialName: 'Butter Blocks', unit: 'kg', currentStock: 15, minimumStockLevel: 5, purchaseCost: 480 })
  ]);

  console.log('Bakery demo ready');
  console.log('Store admin login: bakery@volmier.test / 123456');
  process.exit(0);
}

seedBakery().catch((error) => {
  console.error(error);
  process.exit(1);
});
