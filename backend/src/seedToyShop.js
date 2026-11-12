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

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`;

const categories = [
  'Action Figures',
  'Board Games',
  'Soft Toys',
  'Educational',
  'Outdoor Play',
  'Vehicles',
  'Arts & Crafts'
];

// Image IDs verified with HTTP 200 against images.unsplash.com
const products = [
  {
    name: 'Superhero Action Figure',
    categoryName: 'Action Figures',
    description: 'Poseable 6-inch figure with accessories',
    price: 499,
    gstPercentage: 12,
    image: img('photo-1566576912321-d58ddd7a6088')
  },
  {
    name: 'Robot Transform Set',
    categoryName: 'Action Figures',
    description: '3-in-1 transform robot for kids',
    price: 799,
    gstPercentage: 12,
    image: img('photo-1485827404703-89b55fcc595e')
  },
  {
    name: 'Dinosaur Figure Pack',
    categoryName: 'Action Figures',
    description: 'Set of 6 colorful dinosaur figures',
    price: 649,
    gstPercentage: 12,
    image: img('photo-1545558014-8692077e9b5c')
  },
  {
    name: 'Soldier Commando Set',
    categoryName: 'Action Figures',
    description: 'Military action figure with gear',
    price: 549,
    gstPercentage: 12,
    image: img('photo-1608889175250-c3b0c1667d3a')
  },
  {
    name: 'Family Ludo Set',
    categoryName: 'Board Games',
    description: 'Classic board game for 4 players',
    price: 249,
    gstPercentage: 12,
    image: img('photo-1611996575749-79a3a250f948')
  },
  {
    name: 'Chess Combo Box',
    categoryName: 'Board Games',
    description: 'Wooden chess pieces with foldable board',
    price: 599,
    gstPercentage: 12,
    image: img('photo-1529699211952-734e80c4d42b')
  },
  {
    name: 'Snakes & Ladders',
    categoryName: 'Board Games',
    description: 'Classic snakes and ladders board',
    price: 199,
    gstPercentage: 12,
    image: img('photo-1553481187-be93c21490a9')
  },
  {
    name: 'UNO Card Pack',
    categoryName: 'Board Games',
    description: 'Family card game for ages 7+',
    price: 179,
    gstPercentage: 12,
    image: img('photo-1608889825205-eebdb9fc5806')
  },
  {
    name: 'Teddy Bear Soft Toy',
    categoryName: 'Soft Toys',
    description: 'Plush teddy bear 30cm',
    price: 399,
    gstPercentage: 12,
    image: img('photo-1559454403-b8fb88521f11')
  },
  {
    name: 'Bunny Plush Pillow',
    categoryName: 'Soft Toys',
    description: 'Soft cuddle pillow toy',
    price: 349,
    gstPercentage: 12,
    image: img('photo-1515488042361-ee00e0ddd4e4')
  },
  {
    name: 'Panda Hug Buddy',
    categoryName: 'Soft Toys',
    description: 'Extra soft panda plush 40cm',
    price: 449,
    gstPercentage: 12,
    image: img('photo-1562043236-559c3b65a6e2')
  },
  {
    name: 'Elephant Soft Toy',
    categoryName: 'Soft Toys',
    description: 'Grey elephant cuddle toy',
    price: 379,
    gstPercentage: 12,
    image: img('photo-1596461404969-9ae70f2830c1')
  },
  {
    name: 'Alphabet Learning Blocks',
    categoryName: 'Educational',
    description: '26 wooden letter blocks',
    price: 450,
    gstPercentage: 5,
    image: img('photo-1587654780291-39c9404d746b')
  },
  {
    name: 'Number Puzzle Board',
    categoryName: 'Educational',
    description: '1-20 number puzzle for kids',
    price: 299,
    gstPercentage: 5,
    image: img('photo-1606092195730-5d7b9af1efc5')
  },
  {
    name: 'STEM Science Kit',
    categoryName: 'Educational',
    description: 'Beginner science experiments box',
    price: 899,
    gstPercentage: 5,
    image: img('photo-1582719471384-894fbb16e074')
  },
  {
    name: 'World Map Puzzle',
    categoryName: 'Educational',
    description: '100-piece kids world map puzzle',
    price: 349,
    gstPercentage: 5,
    image: img('photo-1621839673705-6617adf9e890')
  },
  {
    name: 'Kids Cricket Bat Set',
    categoryName: 'Outdoor Play',
    description: 'Bat with 3 plastic balls',
    price: 550,
    gstPercentage: 12,
    image: img('photo-1574629810360-7efbbe195018')
  },
  {
    name: 'Frisbee Disc',
    categoryName: 'Outdoor Play',
    description: 'Flying disc for outdoor play',
    price: 149,
    gstPercentage: 12,
    image: img('photo-1612872087720-bb876e2e67d1')
  },
  {
    name: 'Bubble Gun Kit',
    categoryName: 'Outdoor Play',
    description: 'Bubble blower with refill liquid',
    price: 199,
    gstPercentage: 12,
    image: img('photo-1530103862676-de8c9debad1d')
  },
  {
    name: 'Skipping Rope',
    categoryName: 'Outdoor Play',
    description: 'Adjustable kids skipping rope',
    price: 129,
    gstPercentage: 12,
    image: img('photo-1575361204480-aadea25e6e68')
  },
  {
    name: 'Remote Control Car',
    categoryName: 'Vehicles',
    description: 'Rechargeable RC car with remote',
    price: 1299,
    gstPercentage: 18,
    image: img('photo-1581235720704-06d3acfcb36f')
  },
  {
    name: 'Die-Cast Race Cars Pack',
    categoryName: 'Vehicles',
    description: 'Set of 5 metal race cars',
    price: 599,
    gstPercentage: 12,
    image: img('photo-1558060370-d644479cb6f7')
  },
  {
    name: 'Toy Train Set',
    categoryName: 'Vehicles',
    description: 'Electric train with track loop',
    price: 1499,
    gstPercentage: 18,
    image: img('photo-1596464716127-f2a82984de30')
  },
  {
    name: 'Push Scooter Mini',
    categoryName: 'Vehicles',
    description: '3-wheel kids scooter',
    price: 1899,
    gstPercentage: 18,
    image: img('photo-1558618666-fcd25c85cd64')
  },
  {
    name: 'Colouring Book Combo',
    categoryName: 'Arts & Crafts',
    description: '2 books with 24 crayons',
    price: 249,
    gstPercentage: 12,
    image: img('photo-1513364776144-60967b0f800f')
  },
  {
    name: 'Clay Modelling Kit',
    categoryName: 'Arts & Crafts',
    description: '12-colour modelling clay set',
    price: 299,
    gstPercentage: 12,
    image: img('photo-1452860606245-08befc0ff44b')
  },
  {
    name: 'Bead Jewellery Set',
    categoryName: 'Arts & Crafts',
    description: 'DIY bead bracelet making kit',
    price: 399,
    gstPercentage: 12,
    image: img('photo-1515562141207-7a88fb7ce338')
  },
  {
    name: 'Sketch Pad & Pencils',
    categoryName: 'Arts & Crafts',
    description: 'A4 sketch pad with 12 pencils',
    price: 279,
    gstPercentage: 12,
    image: img('photo-1513542789411-b6a5d4f31634')
  }
];

async function seedToyShop() {
  await connectDB();
  await clearBusinessData();

  const tenant = await Tenant.create({
    name: 'Volmier Toy Shop',
    businessType: 'toy_shop',
    ownerName: 'Toy Shop Admin',
    email: 'toys@volmier.test',
    mobile: '9000000005',
    address: 'Toy Market, Demo City',
    gstNumber: '27TOYSHOP123B1Z5',
    status: 'active'
  });

  await User.create({
    name: 'Toy Shop Admin',
    email: 'toys@volmier.test',
    mobile: '9000000005',
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
    Table.create({ tenant: tenant._id, name: 'Counter-1', capacity: 1, floor: 'Toy Shop', status: 'available' }),
    Table.create({ tenant: tenant._id, name: 'Billing Desk', capacity: 1, floor: 'Toy Shop', status: 'available' })
  ]);
  await Promise.all([
    Customer.create({ tenant: tenant._id, name: 'Meera Kulkarni', mobile: '9855556677', address: 'Kids Zone' }),
    Customer.create({ tenant: tenant._id, name: 'Arjun Nair', mobile: '9866667788', address: 'Play Street' })
  ]);
  await Promise.all([
    Inventory.create({ tenant: tenant._id, materialName: 'Gift Wrapping Rolls', unit: 'pcs', currentStock: 40, minimumStockLevel: 10, purchaseCost: 25 }),
    Inventory.create({ tenant: tenant._id, materialName: 'Battery Pack AA', unit: 'pack', currentStock: 30, minimumStockLevel: 8, purchaseCost: 80 }),
    Inventory.create({ tenant: tenant._id, materialName: 'Carry Bags Medium', unit: 'pcs', currentStock: 100, minimumStockLevel: 25, purchaseCost: 5 })
  ]);

  console.log(`Toy shop demo ready (${products.length} products with images)`);
  console.log('Store admin login: toys@volmier.test / 123456');
  process.exit(0);
}

seedToyShop().catch((error) => {
  console.error(error);
  process.exit(1);
});
