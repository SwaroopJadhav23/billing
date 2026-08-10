import { Bill } from '../models/Bill.js';
import { Customer } from '../models/Customer.js';
import { Kot } from '../models/Kot.js';
import { MenuItem } from '../models/MenuItem.js';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { OrderItem } from '../models/OrderItem.js';
import { Table } from '../models/Table.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ROLES } from '../config/roles.js';
import { requireTenantId } from '../utils/tenantScope.js';

function computeTotals(items = [], discount = 0, serviceCharge = 0) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
  const gstTotal = items.reduce((sum, item) => {
    const line = Number(item.price || 0) * Number(item.quantity || 1);
    return sum + (line * Number(item.gstPercentage || 0)) / 100;
  }, 0);
  const safeDiscount = Math.max(0, Number(discount || 0));
  const safeService = Math.max(0, Number(serviceCharge || 0));
  const grandTotal = Math.max(0, subtotal + gstTotal + safeService - safeDiscount);
  return {
    subtotal: Number(subtotal.toFixed(2)),
    gstTotal: Number(gstTotal.toFixed(2)),
    serviceCharge: safeService,
    discount: safeDiscount,
    grandTotal: Number(grandTotal.toFixed(2))
  };
}

export const createOrder = asyncHandler(async (req, res) => {
  const tenant = requireTenantId(req);
  const rawItems = Array.isArray(req.body.items) ? req.body.items : [];
  if (!rawItems.length) throw new ApiError(400, 'At least one item is required');

  const menuIds = rawItems.map((item) => item.menuItem).filter(Boolean);
  const menuDocs = await MenuItem.find({
    _id: { $in: menuIds },
    tenant,
    status: 'active'
  });
  const menuMap = new Map(menuDocs.map((doc) => [String(doc._id), doc]));

  const items = rawItems.map((line) => {
    const qty = Math.max(1, Number(line.quantity || 1));
    const menu = line.menuItem ? menuMap.get(String(line.menuItem)) : null;
    if (line.menuItem && !menu) throw new ApiError(400, 'Invalid menu item for this store');
    const price = menu ? Number(menu.price) : Number(line.price);
    const gstPercentage = menu ? Number(menu.gstPercentage || 0) : Number(line.gstPercentage || 0);
    const name = menu ? menu.name : line.name;
    if (!name || Number.isNaN(price) || price < 0) throw new ApiError(400, 'Invalid order item');
    return {
      menuItem: menu?._id || line.menuItem,
      name,
      price,
      gstPercentage,
      quantity: qty,
      note: line.note || ''
    };
  });

  if (req.body.customer) {
    const customer = await Customer.findOne({ _id: req.body.customer, tenant });
    if (!customer) throw new ApiError(400, 'Invalid customer for this store');
  }
  if (req.body.table) {
    const table = await Table.findOne({ _id: req.body.table, tenant });
    if (!table) throw new ApiError(400, 'Invalid table for this store');
  }

  const computed = computeTotals(items, req.body.discount, req.body.serviceCharge);
  const order = await Order.create({
    type: req.body.type || 'takeaway',
    customer: req.body.customer || null,
    table: req.body.table || null,
    items,
    ...computed,
    tenant,
    orderNumber: `ORD-${Date.now()}`,
    createdBy: req.user._id,
    timeline: [{ status: 'created', by: req.user._id }]
  });

  if (order.table) await Table.findByIdAndUpdate(order.table, { status: 'occupied', currentOrder: order._id });
  await OrderItem.insertMany(items.map((item) => ({ ...item, order: order._id, tenant })));

  const room = `tenant:${String(tenant)}:pos`;
  req.app.get('io')?.to(room).emit('order:updated', order);
  res.status(201).json(order);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user?.role !== ROLES.SUPER_ADMIN) {
    if (!req.user?.tenant) throw new ApiError(403, 'No store assigned to this user');
    filter.tenant = req.user.tenant;
  }
  const order = await Order.findOne(filter);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  order.status = req.body.status;
  order.timeline.push({ status: req.body.status, by: req.user._id });
  await order.save();
  const room = order.tenant ? `tenant:${String(order.tenant)}:pos` : 'pos';
  req.app.get('io')?.to(room).emit('order:updated', order);
  res.json(order);
});

export const generateKot = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user?.role !== ROLES.SUPER_ADMIN) {
    if (!req.user?.tenant) throw new ApiError(403, 'No store assigned to this user');
    filter.tenant = req.user.tenant;
  }
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
  const kitchenRoom = order.tenant ? `tenant:${String(order.tenant)}:kitchen` : 'kitchen';
  req.app.get('io')?.to(kitchenRoom).emit('kot:new', kot);
  res.status(201).json(kot);
});

export const createBill = asyncHandler(async (req, res) => {
  const filter = { _id: req.body.order };
  if (req.user?.role !== ROLES.SUPER_ADMIN) {
    if (!req.user?.tenant) throw new ApiError(403, 'No store assigned to this user');
    filter.tenant = req.user.tenant;
  }
  const order = await Order.findOne(filter).populate('customer');
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const discount = req.body.discount !== undefined ? Number(req.body.discount) : order.discount;
  const serviceCharge = req.body.serviceCharge !== undefined ? Number(req.body.serviceCharge) : order.serviceCharge;
  const computed = computeTotals(order.items, discount, serviceCharge);

  if (req.body.grandTotal != null && Number(req.body.grandTotal) !== computed.grandTotal) {
    throw new ApiError(400, 'Rejected client total — server recalculated amount');
  }

  const paymentMode = req.body.paymentMode;
  if (!['cash', 'upi', 'card'].includes(paymentMode)) throw new ApiError(400, 'Invalid payment mode');

  const bill = await Bill.create({
    tenant: order.tenant,
    invoiceNumber: `INV-${Date.now()}`,
    order: order._id,
    customer: order.customer,
    items: order.items,
    subtotal: computed.subtotal,
    discount: computed.discount,
    gstTotal: computed.gstTotal,
    serviceCharge: computed.serviceCharge,
    grandTotal: computed.grandTotal,
    paymentMode,
    paidAmount: computed.grandTotal,
    restaurant: req.body.restaurant,
    createdBy: req.user._id
  });

  await Payment.create({
    tenant: order.tenant,
    bill: bill._id,
    amount: bill.grandTotal,
    mode: bill.paymentMode,
    collectedBy: req.user._id
  });

  order.status = 'completed';
  order.discount = computed.discount;
  order.serviceCharge = computed.serviceCharge;
  order.subtotal = computed.subtotal;
  order.gstTotal = computed.gstTotal;
  order.grandTotal = computed.grandTotal;
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
