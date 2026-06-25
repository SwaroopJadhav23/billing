import express from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { createBill, createOrder, generateKot, updateOrderStatus } from '../controllers/orderController.js';
import { updateKotStatus } from '../controllers/kotController.js';
import { PERMISSIONS, ROLES } from '../config/roles.js';
import { allowRoles, protect } from '../middleware/auth.js';
import { Bill } from '../models/Bill.js';
import { Customer } from '../models/Customer.js';
import { Expense } from '../models/Expense.js';
import { Inventory } from '../models/Inventory.js';
import { Kot } from '../models/Kot.js';
import { MenuCategory } from '../models/MenuCategory.js';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { Report } from '../models/Report.js';
import { Restaurant } from '../models/Restaurant.js';
import { Role } from '../models/Role.js';
import { Setting } from '../models/Setting.js';
import { Staff } from '../models/Staff.js';
import { Supplier } from '../models/Supplier.js';
import { Table } from '../models/Table.js';
import authRoutes from './authRoutes.js';
import menuItemRoutes from './menuItemRoutes.js';
import { crudRoutes } from './resourceRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.get('/dashboard', protect, allowRoles(...PERMISSIONS.dashboard), getDashboard);

router.use('/menu-categories', crudRoutes(MenuCategory, PERMISSIONS.menu));
router.use('/menu-items', menuItemRoutes);
router.use('/tables', crudRoutes(Table, PERMISSIONS.tables));
router.use('/customers', crudRoutes(Customer, PERMISSIONS.customers));
router.use('/inventory', crudRoutes(Inventory, PERMISSIONS.inventory, { populate: 'supplier' }));
router.use('/suppliers', crudRoutes(Supplier, [ROLES.SUPER_ADMIN, ROLES.MANAGER]));
router.use('/staff', crudRoutes(Staff, PERMISSIONS.staff));
router.use('/expenses', crudRoutes(Expense, PERMISSIONS.expenses));
router.use('/payments', crudRoutes(Payment, [ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.CASHIER], { populate: 'bill collectedBy' }));
router.use('/bills', crudRoutes(Bill, [ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.CASHIER], { populate: 'order customer createdBy' }));
router.use('/roles', crudRoutes(Role, [ROLES.SUPER_ADMIN]));
router.use('/reports', crudRoutes(Report, PERMISSIONS.reports, { populate: 'generatedBy' }));
router.use('/restaurants', crudRoutes(Restaurant, [ROLES.SUPER_ADMIN]));
router.use('/settings', crudRoutes(Setting, PERMISSIONS.settings));

router.get('/orders', protect, allowRoles(...PERMISSIONS.orders), async (req, res, next) => {
  try {
    const items = await Order.find().populate('customer table').sort('-createdAt').limit(100);
    res.json({ items, total: items.length, page: 1, pages: 1 });
  } catch (error) {
    next(error);
  }
});
router.post('/orders', protect, allowRoles(...PERMISSIONS.orders), createOrder);
router.patch('/orders/:id/status', protect, allowRoles(...PERMISSIONS.orders), updateOrderStatus);
router.post('/orders/:id/kot', protect, allowRoles(...PERMISSIONS.kot), generateKot);
router.post('/bills/generate', protect, allowRoles(ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.CASHIER), createBill);
router.patch('/kots/:id/status', protect, allowRoles(...PERMISSIONS.kot), updateKotStatus);
router.use('/kots', crudRoutes(Kot, PERMISSIONS.kot, { populate: 'order table sentBy' }));

router.get('/reports/summary/export', protect, allowRoles(...PERMISSIONS.reports), (req, res) => {
  res.json({ message: 'Reports API ready', exports: ['pdf', 'excel', 'print'] });
});

export default router;
