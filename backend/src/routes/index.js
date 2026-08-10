import express from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { createBill, createOrder, generateKot, updateOrderStatus } from '../controllers/orderController.js';
import { updateKotStatus } from '../controllers/kotController.js';
import { PERMISSIONS, ROLES } from '../config/roles.js';
import { allowRoles, protect } from '../middleware/auth.js';
import { requireFeature } from '../middleware/requireFeature.js';
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
import { Branch } from '../models/Branch.js';
import authRoutes from './authRoutes.js';
import menuItemRoutes from './menuItemRoutes.js';
import tenantRoutes from './tenantRoutes.js';
import { crudRoutes } from './resourceRoutes.js';
import { applyTenantFilter } from '../utils/tenantScope.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/tenants', tenantRoutes);

router.get('/dashboard', protect, allowRoles(...PERMISSIONS.dashboard), requireFeature('dashboard'), getDashboard);

router.use('/menu-categories', crudRoutes(MenuCategory, PERMISSIONS.menu, { feature: 'menu' }));
router.use('/menu-items', menuItemRoutes);
router.use('/tables', crudRoutes(Table, PERMISSIONS.tables, { feature: 'tables' }));
router.use('/customers', crudRoutes(Customer, PERMISSIONS.customers, { feature: 'customers' }));
router.use('/inventory', crudRoutes(Inventory, PERMISSIONS.inventory, { populate: 'supplier', feature: 'inventory' }));
router.use('/suppliers', crudRoutes(Supplier, [ROLES.SUPER_ADMIN, ROLES.MANAGER], { feature: 'inventory' }));
router.use('/staff', crudRoutes(Staff, PERMISSIONS.staff, { populate: 'branch', feature: 'staff' }));
router.use('/branches', crudRoutes(Branch, PERMISSIONS.branches, { feature: 'branches' }));
router.use('/expenses', crudRoutes(Expense, PERMISSIONS.expenses, { feature: 'expenses' }));
router.use('/payments', crudRoutes(Payment, [ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.CASHIER], { populate: 'bill collectedBy', feature: 'pos' }));
router.use('/bills', crudRoutes(Bill, [ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.CASHIER], { populate: 'order customer createdBy', feature: 'pos' }));
router.use('/roles', crudRoutes(Role, [ROLES.SUPER_ADMIN], { scoped: false }));
router.use('/reports', crudRoutes(Report, PERMISSIONS.reports, { populate: 'generatedBy', feature: 'reports' }));
router.use('/restaurants', crudRoutes(Restaurant, [ROLES.SUPER_ADMIN, ROLES.MANAGER], { feature: 'settings' }));
router.use('/settings', crudRoutes(Setting, PERMISSIONS.settings, { feature: 'settings' }));

router.get('/orders', protect, allowRoles(...PERMISSIONS.orders), requireFeature('orders'), asyncHandler(async (req, res) => {
  const query = applyTenantFilter(req, {});
  const items = await Order.find(query).populate('customer table').sort('-createdAt').limit(100);
  res.json({ items, total: items.length, page: 1, pages: 1 });
}));
router.post('/orders', protect, allowRoles(...PERMISSIONS.orders), requireFeature('pos'), createOrder);
router.patch('/orders/:id/status', protect, allowRoles(...PERMISSIONS.orders), requireFeature('orders'), updateOrderStatus);
router.post('/orders/:id/kot', protect, allowRoles(...PERMISSIONS.kot), requireFeature('orders'), generateKot);
router.post('/bills/generate', protect, allowRoles(ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.CASHIER), requireFeature('pos'), createBill);
router.patch('/kots/:id/status', protect, allowRoles(...PERMISSIONS.kot), requireFeature('orders'), updateKotStatus);
router.use('/kots', crudRoutes(Kot, PERMISSIONS.kot, { populate: 'order table sentBy', feature: 'orders' }));

router.get('/reports/summary/export', protect, allowRoles(...PERMISSIONS.reports), requireFeature('reports'), (req, res) => {
  res.json({ message: 'Reports API ready', exports: ['pdf', 'excel', 'print'] });
});

export default router;
