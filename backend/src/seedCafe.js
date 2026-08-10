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

const categories = ['Coffee', 'Tea & Hot Drinks', 'Cold Beverages', 'Sandwiches & Wraps', 'Bakery Bites'];

const products = [
  { name: 'Espresso', categoryName: 'Coffee', description: 'Single shot espresso', price: 90, gstPercentage: 5 },
  { name: 'Cappuccino', categoryName: 'Coffee', description: 'Espresso with steamed milk foam', price: 140, gstPercentage: 5 },
  { name: 'Cafe Latte', categoryName: 'Coffee', description: 'Smooth milk coffee', price: 150, gstPercentage: 5 },
  { name: 'Masala Chai', categoryName: 'Tea & Hot Drinks', description: 'Spiced Indian tea', price: 60, gstPercentage: 5 },
  { name: 'Green Tea', categoryName: 'Tea & Hot Drinks', description: 'Hot green tea cup', price: 80, gstPercentage: 5 },
  { name: 'Hot Chocolate', categoryName: 'Tea & Hot Drinks', description: 'Rich cocoa drink', price: 130, gstPercentage: 5 },
  { name: 'Iced Americano', categoryName: 'Cold Beverages', description: 'Chilled espresso over ice', price: 160, gstPercentage: 5 },
  { name: 'Cold Coffee', categoryName: 'Cold Beverages', description: 'Blended iced coffee', price: 170, gstPercentage: 5 },
  { name: 'Fresh Lemonade', categoryName: 'Cold Beverages', description: 'Chilled lemon cooler', price: 100, gstPercentage: 5 },
  { name: 'Veg Club Sandwich', categoryName: 'Sandwiches & Wraps', description: 'Triple-layer veg sandwich', price: 180, gstPercentage: 5 },
  { name: 'Paneer Wrap', categoryName: 'Sandwiches & Wraps', description: 'Grilled paneer wrap', price: 190, gstPercentage: 5 },
  { name: 'Chocolate Brownie', categoryName: 'Bakery Bites', description: 'Warm fudge brownie', price: 120, gstPercentage: 5 },
  { name: 'Blueberry Muffin', categoryName: 'Bakery Bites', description: 'Fresh baked muffin', price: 100, gstPercentage: 5 }
];

async function seedCafe() {
  await connectDB();
  await clearBusinessData();

  const tenant = await Tenant.create({
    name: 'Volmier Cafe Lounge',
    businessType: 'cafe',
    ownerName: 'Cafe Admin',
    email: 'cafe@volmier.test',
    mobile: '9000000004',
    address: 'Cafe Plaza, Demo City',
    gstNumber: '27CAFECO1234C1Z2',
    status: 'active'
  });

  await User.create({
    name: 'Cafe Admin',
    email: 'cafe@volmier.test',
    mobile: '9000000004',
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
    Table.create({ tenant: tenant._id, name: 'Window-1', capacity: 2, floor: 'Ground', status: 'available' }),
    Table.create({ tenant: tenant._id, name: 'Window-2', capacity: 2, floor: 'Ground', status: 'available' }),
    Table.create({ tenant: tenant._id, name: 'Lounge-A', capacity: 4, floor: 'Ground', status: 'available' }),
    Table.create({ tenant: tenant._id, name: 'Lounge-B', capacity: 4, floor: 'Mezzanine', status: 'available' })
  ]);
  await Promise.all([
    Customer.create({ tenant: tenant._id, name: 'Neha Kapoor', mobile: '9833334455', address: 'Cafe Plaza' }),
    Customer.create({ tenant: tenant._id, name: 'Aarav Singh', mobile: '9844445566', address: 'Old Town' })
  ]);
  await Promise.all([
    Inventory.create({ tenant: tenant._id, materialName: 'Coffee Beans', unit: 'kg', currentStock: 18, minimumStockLevel: 5, purchaseCost: 650 }),
    Inventory.create({ tenant: tenant._id, materialName: 'Milk Crates', unit: 'liter', currentStock: 60, minimumStockLevel: 20, purchaseCost: 55 }),
    Inventory.create({ tenant: tenant._id, materialName: 'Chocolate Syrup', unit: 'bottle', currentStock: 10, minimumStockLevel: 3, purchaseCost: 280 })
  ]);

  console.log('Cafe demo ready');
  console.log('Store admin login: cafe@volmier.test / 123456');
  process.exit(0);
}

seedCafe().catch((error) => {
  console.error(error);
  process.exit(1);
});
