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

const categories = ['Starters', 'Main Course', 'Breads & Rice', 'Desserts', 'Beverages'];

const products = [
  { name: 'Paneer Tikka', categoryName: 'Starters', description: 'Tandoor grilled cottage cheese', price: 260, gstPercentage: 5 },
  { name: 'Veg Spring Rolls', categoryName: 'Starters', description: 'Crispy vegetable rolls', price: 180, gstPercentage: 5 },
  { name: 'Chicken Soup', categoryName: 'Starters', description: 'Hot clear chicken soup', price: 150, gstPercentage: 5 },
  { name: 'Butter Chicken', categoryName: 'Main Course', description: 'Creamy tomato gravy', price: 340, gstPercentage: 5 },
  { name: 'Dal Makhani', categoryName: 'Main Course', description: 'Slow cooked black lentils', price: 240, gstPercentage: 5 },
  { name: 'Veg Biryani', categoryName: 'Main Course', description: 'Fragrant basmati rice', price: 220, gstPercentage: 5 },
  { name: 'Butter Naan', categoryName: 'Breads & Rice', description: 'Soft buttered naan', price: 50, gstPercentage: 5 },
  { name: 'Jeera Rice', categoryName: 'Breads & Rice', description: 'Cumin tempered rice', price: 120, gstPercentage: 5 },
  { name: 'Gulab Jamun', categoryName: 'Desserts', description: '2 pieces hot gulab jamun', price: 90, gstPercentage: 5 },
  { name: 'Ice Cream Scoop', categoryName: 'Desserts', description: 'Vanilla / chocolate', price: 80, gstPercentage: 5 },
  { name: 'Fresh Lime Soda', categoryName: 'Beverages', description: 'Sweet or salted', price: 70, gstPercentage: 5 },
  { name: 'Masala Chaas', categoryName: 'Beverages', description: 'Spiced buttermilk', price: 60, gstPercentage: 5 }
];

async function seedRestaurant() {
  await connectDB();
  await clearBusinessData();

  const tenant = await Tenant.create({
    name: 'Volmier Family Restaurant',
    businessType: 'restaurant',
    ownerName: 'Restaurant Admin',
    email: 'restaurant@volmier.test',
    mobile: '9000000003',
    address: 'Food Street, Demo City',
    gstNumber: '27RESTAU1234R1Z8',
    status: 'active'
  });

  await User.create({
    name: 'Restaurant Admin',
    email: 'restaurant@volmier.test',
    mobile: '9000000003',
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
    Table.create({ tenant: tenant._id, name: 'T1', capacity: 2, floor: 'Ground', status: 'available' }),
    Table.create({ tenant: tenant._id, name: 'T2', capacity: 4, floor: 'Ground', status: 'available' }),
    Table.create({ tenant: tenant._id, name: 'T3', capacity: 4, floor: 'Ground', status: 'available' }),
    Table.create({ tenant: tenant._id, name: 'T4', capacity: 6, floor: 'First', status: 'available' }),
    Table.create({ tenant: tenant._id, name: 'T5', capacity: 8, floor: 'First', status: 'available' })
  ]);
  await Promise.all([
    Customer.create({ tenant: tenant._id, name: 'Rahul Mehta', mobile: '9811112233', address: 'Food Street' }),
    Customer.create({ tenant: tenant._id, name: 'Priya Desai', mobile: '9822223344', address: 'Lake View' })
  ]);
  await Promise.all([
    Inventory.create({ tenant: tenant._id, materialName: 'Chicken Stock', unit: 'kg', currentStock: 25, minimumStockLevel: 8, purchaseCost: 220 }),
    Inventory.create({ tenant: tenant._id, materialName: 'Paneer Blocks', unit: 'kg', currentStock: 12, minimumStockLevel: 4, purchaseCost: 320 }),
    Inventory.create({ tenant: tenant._id, materialName: 'Basmati Rice', unit: 'kg', currentStock: 40, minimumStockLevel: 10, purchaseCost: 95 })
  ]);

  console.log('Restaurant demo ready');
  console.log('Store admin login: restaurant@volmier.test / 123456');
  process.exit(0);
}

seedRestaurant().catch((error) => {
  console.error(error);
  process.exit(1);
});
