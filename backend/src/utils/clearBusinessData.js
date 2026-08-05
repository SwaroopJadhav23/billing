import { Branch } from '../models/Branch.js';
import { Bill } from '../models/Bill.js';
import { Customer } from '../models/Customer.js';
import { Expense } from '../models/Expense.js';
import { Inventory } from '../models/Inventory.js';
import { Kot } from '../models/Kot.js';
import { MenuCategory } from '../models/MenuCategory.js';
import { MenuItem } from '../models/MenuItem.js';
import { Order } from '../models/Order.js';
import { OrderItem } from '../models/OrderItem.js';
import { Payment } from '../models/Payment.js';
import { Report } from '../models/Report.js';
import { Restaurant } from '../models/Restaurant.js';
import { Setting } from '../models/Setting.js';
import { Staff } from '../models/Staff.js';
import { Supplier } from '../models/Supplier.js';
import { Table } from '../models/Table.js';
import { Tenant } from '../models/Tenant.js';
import { User } from '../models/User.js';
import { ROLES } from '../config/roles.js';

export async function clearBusinessData() {
  await Promise.all([
    Branch.deleteMany({}),
    Bill.deleteMany({}),
    Customer.deleteMany({}),
    Expense.deleteMany({}),
    Inventory.deleteMany({}),
    Kot.deleteMany({}),
    MenuCategory.deleteMany({}),
    MenuItem.deleteMany({}),
    Order.deleteMany({}),
    OrderItem.deleteMany({}),
    Payment.deleteMany({}),
    Report.deleteMany({}),
    Restaurant.deleteMany({}),
    Setting.deleteMany({}),
    Staff.deleteMany({}),
    Supplier.deleteMany({}),
    Table.deleteMany({}),
    Tenant.deleteMany({}),
    User.deleteMany({ role: { $ne: ROLES.SUPER_ADMIN } })
  ]);
}
