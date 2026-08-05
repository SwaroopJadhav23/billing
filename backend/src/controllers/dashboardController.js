import { Bill } from '../models/Bill.js';
import { Expense } from '../models/Expense.js';
import { Kot } from '../models/Kot.js';
import { Order } from '../models/Order.js';
import { Table } from '../models/Table.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../config/roles.js';

function tenantMatch(req) {
  if (req.user?.role === ROLES.SUPER_ADMIN) {
    return req.query.tenantId ? { tenant: req.query.tenantId } : {};
  }
  return { tenant: req.user?.tenant || null };
}

export const getDashboard = asyncHandler(async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const tenantFilter = tenantMatch(req);

  const [
    salesAgg,
    totalOrders,
    occupiedTables,
    availableTables,
    pendingKots,
    latestOrders,
    latestBills,
    recentPayments,
    expensesAgg
  ] = await Promise.all([
    Bill.aggregate([{ $match: { ...tenantFilter, createdAt: { $gte: start } } }, { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } }]),
    Order.countDocuments({ ...tenantFilter, createdAt: { $gte: start } }),
    Table.countDocuments({ ...tenantFilter, status: 'occupied' }),
    Table.countDocuments({ ...tenantFilter, status: 'available' }),
    Kot.countDocuments({ ...tenantFilter, status: { $in: ['new', 'preparing'] } }),
    Order.find(tenantFilter).sort('-createdAt').limit(8).populate('customer table'),
    Bill.find(tenantFilter).sort('-createdAt').limit(8).populate('customer'),
    Bill.find(tenantFilter).sort('-createdAt').limit(8).select('invoiceNumber grandTotal paymentMode createdAt'),
    Expense.aggregate([{ $match: { ...tenantFilter, createdAt: { $gte: start } } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
  ]);

  const todaySales = salesAgg[0]?.total || 0;

  res.json({
    cards: {
      todaySales,
      totalOrders,
      totalRevenue: todaySales,
      occupiedTables,
      availableTables,
      activeCustomers: latestOrders.length,
      pendingKots,
      todayCollection: todaySales,
      todayExpenses: expensesAgg[0]?.total || 0
    },
    charts: {
      dailySales: await salesByPeriod(7, 'day', tenantFilter),
      weeklyRevenue: await salesByPeriod(8, 'week', tenantFilter),
      monthlyRevenue: await salesByPeriod(12, 'month', tenantFilter),
      topSellingItems: await topItems(tenantFilter),
      categorySalesDistribution: await categoryDistribution(tenantFilter)
    },
    recent: { latestOrders, latestBills, recentPayments }
  });
});

async function salesByPeriod(limit, unit, tenantFilter = {}) {
  const format = unit === 'month' ? '%Y-%m' : unit === 'week' ? '%Y-W%U' : '%Y-%m-%d';
  return Bill.aggregate([
    ...(Object.keys(tenantFilter).length ? [{ $match: tenantFilter }] : []),
    { $group: { _id: { $dateToString: { format, date: '$createdAt' } }, total: { $sum: '$grandTotal' } } },
    { $sort: { _id: -1 } },
    { $limit: limit },
    { $project: { label: '$_id', value: '$total', _id: 0 } }
  ]);
}

async function topItems(tenantFilter = {}) {
  return Bill.aggregate([
    ...(Object.keys(tenantFilter).length ? [{ $match: tenantFilter }] : []),
    { $unwind: '$items' },
    { $group: { _id: '$items.name', value: { $sum: '$items.quantity' } } },
    { $sort: { value: -1 } },
    { $limit: 6 },
    { $project: { label: '$_id', value: 1, _id: 0 } }
  ]);
}

async function categoryDistribution(tenantFilter = {}) {
  return Order.aggregate([
    ...(Object.keys(tenantFilter).length ? [{ $match: tenantFilter }] : []),
    { $unwind: '$items' },
    { $group: { _id: '$items.name', value: { $sum: '$items.quantity' } } },
    { $sort: { value: -1 } },
    { $limit: 6 },
    { $project: { label: '$_id', value: 1, _id: 0 } }
  ]);
}
