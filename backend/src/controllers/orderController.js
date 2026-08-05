import { Bill } from '../models/Bill.js';
import { Customer } from '../models/Customer.js';
import { Kot } from '../models/Kot.js';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { OrderItem } from '../models/OrderItem.js';
import { Table } from '../models/Table.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ROLES } from '../config/roles.js';

function totals(items = [], discount = 0, serviceCharge = 0) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
  const gstTotal = items.reduce((sum, item) => {
    const line = Number(item.price || 0) * Number(item.quantity || 1);
    return sum + (line * Number(item.gstPercentage || 0)) / 100;
  }, 0);
  const grandTotal = Math.max(0, subtotal + gstTotal + Number(serviceCharge || 0) - Number(discount || 0));
  return { subtotal, gstTotal, serviceCharge: Number(serviceCharge || 0), discount: Number(discount || 0), grandTotal };
}

function requireTenant(req) {
  if (req.user?.role === ROLES.SUPER_ADMIN) return req.body.tenant || null;
  if (!req.user?.tenant) throw new ApiError(403, 'No store assigned to this user');
  return req.user.tenant;
}

export const createOrder = asyncHandler(async (req, res) => {
  const tenant = requireTenant(req);
  const orderNumber = `ORD-${Date.now()}`;
  const computed = totals(req.body.items, req.body.discount, req.body.serviceCharge);
  const order = await Order.create({
    ...req.body,
    ...computed,
    tenant,
    orderNumber,
    createdBy: req.user._id,
    timeline: [{ status: 'created', by: req.user._id }]
  });
  if (order.table) await Table.findByIdAndUpdate(order.table, { status: 'occupied', currentOrder: order._id });
  await OrderItem.insertMany(order.items.map((item) => ({ ...(item.toObject?.() || item), order: order._id, tenant })));
  res.status(201).json(order);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user?.role !== ROLES.SUPER_ADMIN) filter.tenant = req.user.tenant;
  const order = await Order.findOne(filter);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  order.status = req.body.status;
  order.timeline.push({ status: req.body.status, by: req.user._id });
  await order.save();
  req.app.get('io')?.emit('order:updated', order);
  res.json(order);
});

export const generateKot = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user?.role !== ROLES.SUPER_ADMIN) filter.tenant = req.user.tenant;
  const order = await Order.findOne(filter);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const kot = await Kot.create({
    tenant: order.tenant,
    kotNumber: `KOT-${Date.now()}`,
    order: order._id,
    table: order.table,
    items: order.items.map((item) => ({ name: item.name, quantity: item.quantity, note: item.note })),
    sentBy: req.user._id
  });
  req.app.get('io')?.emit('kot:new', kot);
  res.status(201).json(kot);
});

export const createBill = asyncHandler(async (req, res) => {
  const filter = { _id: req.body.order };
  if (req.user?.role !== ROLES.SUPER_ADMIN) filter.tenant = req.user.tenant;
  const order = await Order.findOne(filter).populate('customer');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const bill = await Bill.create({
    tenant: order.tenant,
    invoiceNumber: `INV-${Date.now()}`,
    order: order._id,
    customer: order.customer,
    items: order.items,
    subtotal: order.subtotal,
    discount: req.body.discount ?? order.discount,
    gstTotal: order.gstTotal,
    serviceCharge: order.serviceCharge,
    grandTotal: req.body.grandTotal ?? order.grandTotal,
    paymentMode: req.body.paymentMode,
    paidAmount: req.body.paidAmount ?? order.grandTotal,
    restaurant: req.body.restaurant,
    createdBy: req.user._id
  });
  await Payment.create({
    tenant: order.tenant,
    bill: bill._id,
    amount: bill.paidAmount,
    mode: bill.paymentMode,
    collectedBy: req.user._id
  });
  order.status = 'completed';
  await order.save();
  if (order.table) await Table.findByIdAndUpdate(order.table, { status: 'available', currentOrder: null });
  if (order.customer) {
    await Customer.findByIdAndUpdate(order.customer, {
      $inc: { totalOrders: 1, totalSpending: bill.grandTotal },
      lastOrderDate: new Date()
    });
  }
  res.status(201).json(bill);
});
