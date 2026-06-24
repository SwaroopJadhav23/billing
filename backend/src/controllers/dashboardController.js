import { Bill } from '../models/Bill.js';
import { Expense } from '../models/Expense.js';
import { Kot } from '../models/Kot.js';
import { Order } from '../models/Order.js';
import { Table } from '../models/Table.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

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
    Bill.aggregate([{ $match: { createdAt: { $gte: start } } }, { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } }]),
    Order.countDocuments({ createdAt: { $gte: start } }),
    Table.countDocuments({ status: 'occupied' }),
    Table.countDocuments({ status: 'available' }),
    Kot.countDocuments({ status: { $in: ['new', 'preparing'] } }),
    Order.find().sort('-createdAt').limit(8).populate('customer table'),
    Bill.find().sort('-createdAt').limit(8).populate('customer'),
    Bill.find().sort('-createdAt').limit(8).select('invoiceNumber grandTotal paymentMode createdAt'),
    Expense.aggregate([{ $match: { createdAt: { $gte: start } } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
  ]);

  const todaySales = salesAgg[0]?.total || 0;
  const todayCollection = todaySales;

  res.json({
    cards: {
      todaySales,
      totalOrders,
      totalRevenue: todaySales,
      occupiedTables,
      availableTables,
      activeCustomers: latestOrders.length,
      pendingKots,
      todayCollection,
      todayExpenses: expensesAgg[0]?.total || 0
    },
    charts: {
      dailySales: await salesByPeriod(7, 'day'),
      weeklyRevenue: await salesByPeriod(8, 'week'),
      monthlyRevenue: await salesByPeriod(12, 'month'),
      topSellingItems: await topItems(),
      categorySalesDistribution: await categoryDistribution()
    },
    recent: { latestOrders, latestBills, recentPayments }
  });
});

async function salesByPeriod(limit, unit) {
  const format = unit === 'month' ? '%Y-%m' : unit === 'week' ? '%Y-W%U' : '%Y-%m-%d';
  return Bill.aggregate([
    { $group: { _id: { $dateToString: { format, date: '$createdAt' } }, total: { $sum: '$grandTotal' } } },
    { $sort: { _id: -1 } },
    { $limit: limit },
    { $project: { label: '$_id', value: '$total', _id: 0 } }
  ]);
}

async function topItems() {
  return Bill.aggregate([
    { $unwind: '$items' },
    { $group: { _id: '$items.name', value: { $sum: '$items.quantity' } } },
    { $sort: { value: -1 } },
    { $limit: 6 },
    { $project: { label: '$_id', value: 1, _id: 0 } }
  ]);
}

async function categoryDistribution() {
  return Order.aggregate([
    { $unwind: '$items' },
    { $group: { _id: '$items.name', value: { $sum: '$items.quantity' } } },
    { $sort: { value: -1 } },
    { $limit: 6 },
    { $project: { label: '$_id', value: 1, _id: 0 } }
  ]);
}
