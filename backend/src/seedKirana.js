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

const products = [
  { name: 'Premium Basmati Rice 1kg', categoryName: 'Grains & Pulses', description: 'Long grain basmati rice pack', price: 120, gstPercentage: 5 },
  { name: 'Wheat Flour 5kg', categoryName: 'Grains & Pulses', description: 'Fresh atta pack', price: 220, gstPercentage: 5 },
  { name: 'Toor Dal 1kg', categoryName: 'Grains & Pulses', description: 'Cleaned toor dal', price: 160, gstPercentage: 5 },
  { name: 'Refined Oil 1L', categoryName: 'Oils & Spices', description: 'Everyday cooking oil', price: 145, gstPercentage: 5 },
  { name: 'Mustard Oil 1L', categoryName: 'Oils & Spices', description: 'Cold pressed mustard oil', price: 180, gstPercentage: 5 },
  { name: 'Turmeric Powder 200g', categoryName: 'Oils & Spices', description: 'Pure haldi powder', price: 55, gstPercentage: 5 },
  { name: 'Toned Milk 1L', categoryName: 'Dairy', description: 'Fresh packaged milk', price: 60, gstPercentage: 5 },
  { name: 'Paneer 200g', categoryName: 'Dairy', description: 'Fresh paneer pack', price: 90, gstPercentage: 5 },
  { name: 'Namkeen Mix 200g', categoryName: 'Snacks & Beverages', description: 'Crunchy snacks pack', price: 45, gstPercentage: 12 },
  { name: 'Tea Powder 250g', categoryName: 'Snacks & Beverages', description: 'Assam tea leaves', price: 95, gstPercentage: 5 },
  { name: 'Bath Soap', categoryName: 'Personal Care', description: 'Gentle bath soap', price: 35, gstPercentage: 18 },
  { name: 'Detergent Powder 1kg', categoryName: 'Personal Care', description: 'Wash detergent', price: 110, gstPercentage: 18 }
];

const categories = ['Grains & Pulses', 'Oils & Spices', 'Dairy', 'Snacks & Beverages', 'Personal Care'];

async function seedKirana() {
  await connectDB();
  await clearBusinessData();

  const tenant = await Tenant.create({
    name: 'Volmier Kirana General Store',
    businessType: 'kirana',
    ownerName: 'Kirana Admin',
    email: 'kirana@volmier.test',
    mobile: '9000000001',
    address: 'Main Market Road, Demo City',
    gstNumber: '27KIRANA1234D1Z5',
    status: 'active'
  });

  await User.create({
    name: 'Kirana Admin',
    email: 'kirana@volmier.test',
    mobile: '9000000001',
    password: '123456',
    loginPassword: '123456',
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
    Table.create({ tenant: tenant._id, name: 'Counter-1', capacity: 1, floor: 'Store', status: 'available' }),
    Table.create({ tenant: tenant._id, name: 'Counter-2', capacity: 1, floor: 'Store', status: 'available' })
  ]);
  await Promise.all([
    Customer.create({ tenant: tenant._id, name: 'Ramesh Patil', mobile: '9876543210', address: 'Lane 2' }),
    Customer.create({ tenant: tenant._id, name: 'Sita Devi', mobile: '9876501234', address: 'Market Area' })
  ]);
  await Promise.all([
    Inventory.create({ tenant: tenant._id, materialName: 'Basmati Rice Stock', unit: 'kg', currentStock: 80, minimumStockLevel: 20, purchaseCost: 90 }),
    Inventory.create({ tenant: tenant._id, materialName: 'Cooking Oil Stock', unit: 'liter', currentStock: 40, minimumStockLevel: 10, purchaseCost: 120 })
  ]);

  console.log('Kirana demo ready');
  console.log('Store admin login: kirana@volmier.test / 123456');
  process.exit(0);
}

seedKirana().catch((error) => {
  console.error(error);
  process.exit(1);
});
