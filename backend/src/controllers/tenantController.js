import { Tenant } from '../models/Tenant.js';
import { User } from '../models/User.js';
import { Bill } from '../models/Bill.js';
import { Inventory } from '../models/Inventory.js';
import { Order } from '../models/Order.js';
import { Customer } from '../models/Customer.js';
import { MenuItem } from '../models/MenuItem.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ROLES } from '../config/roles.js';
import { mergeTenantFeatures } from '../config/tenantFeatures.js';

export const listTenants = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { ownerName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { mobile: new RegExp(search, 'i') }
    ];
  }
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Tenant.find(query).sort('-createdAt').skip(skip).limit(Number(limit)),
    Tenant.countDocuments(query)
  ]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) || 1 });
});

export const createTenant = asyncHandler(async (req, res) => {
  const {
    name,
    businessType = 'other',
    ownerName,
    email,
    mobile,
    address,
    gstNumber,
    adminName,
    adminEmail,
    adminPassword,
    adminMobile
  } = req.body;

  if (!name || !adminEmail || !adminPassword) {
    throw new ApiError(400, 'Store name, admin email and password are required');
  }

  const existingUser = await User.findOne({ email: String(adminEmail).toLowerCase() });
  if (existingUser) throw new ApiError(400, 'Admin email already exists');

  const tenant = await Tenant.create({
    name,
    businessType,
    ownerName: ownerName || adminName,
    email: email || adminEmail,
    mobile: mobile || adminMobile,
    address,
    gstNumber,
    status: 'active',
    features: mergeTenantFeatures(req.body.features)
  });

  const admin = await User.create({
    name: adminName || ownerName || 'Store Admin',
    email: String(adminEmail).toLowerCase(),
    mobile: adminMobile || mobile,
    password: adminPassword,
    loginPassword: adminPassword,
    role: ROLES.MANAGER,
    tenant: tenant._id,
    status: 'active'
  });

  res.status(201).json({
    tenant,
    admin: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      mobile: admin.mobile,
      role: admin.role,
      tenant: admin.tenant,
      loginId: admin.email,
      loginPassword: adminPassword
    }
  });
});

export const getTenant = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.params.id);
  if (!tenant) throw new ApiError(404, 'Store not found');

  const tenantFilter = { tenant: tenant._id };
  const [productCount, inventoryCount, billsCount, ordersCount, customersCount, revenueAgg, admins] = await Promise.all([
    MenuItem.countDocuments(tenantFilter),
    Inventory.countDocuments(tenantFilter),
    Bill.countDocuments(tenantFilter),
    Order.countDocuments(tenantFilter),
    Customer.countDocuments(tenantFilter),
    Bill.aggregate([{ $match: tenantFilter }, { $group: { _id: null, total: { $sum: '$grandTotal' } } }]),
    User.find({ tenant: tenant._id }).select('+loginPassword')
  ]);

  res.json({
    tenant,
    summary: {
      products: productCount,
      inventory: inventoryCount,
      bills: billsCount,
      orders: ordersCount,
      customers: customersCount,
      revenue: revenueAgg[0]?.total || 0
    },
    admins: admins.map((admin) => {
      const item = admin.toObject();
      return {
        ...item,
        loginId: item.email,
        password: item.loginPassword || null
      };
    })
  });
});

export const updateTenantAdminPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password || String(password).length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }
  const admin = await User.findOne({ _id: req.params.userId, tenant: req.params.id }).select('+password +loginPassword');
  if (!admin) throw new ApiError(404, 'Store admin not found');
  admin.password = password;
  admin.loginPassword = password;
  await admin.save();
  res.json({
    _id: admin._id,
    email: admin.email,
    loginId: admin.email,
    password
  });
});

export const updateTenant = asyncHandler(async (req, res) => {
  const allowed = ['name', 'businessType', 'ownerName', 'email', 'mobile', 'address', 'gstNumber', 'status'];
  const payload = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) payload[key] = req.body[key];
  });
  if (req.body.features !== undefined) {
    const existing = await Tenant.findById(req.params.id).select('features');
    if (!existing) throw new ApiError(404, 'Store not found');
    payload.features = mergeTenantFeatures({
      ...(existing.features?.toObject?.() || existing.features || {}),
      ...req.body.features
    });
  }
  const tenant = await Tenant.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!tenant) throw new ApiError(404, 'Store not found');

  if (payload.status) {
    await User.updateMany(
      { tenant: tenant._id, role: { $ne: ROLES.SUPER_ADMIN } },
      { status: payload.status === 'active' ? 'active' : 'inactive' }
    );
  }

  res.json(tenant);
});

export const listTenantBills = asyncHandler(async (req, res) => {
  const items = await Bill.find({ tenant: req.params.id }).sort('-createdAt').limit(100).populate('customer createdBy');
  res.json({ items, total: items.length });
});

export const listTenantInventory = asyncHandler(async (req, res) => {
  const items = await Inventory.find({ tenant: req.params.id }).sort('-createdAt').limit(100).populate('supplier');
  res.json({ items, total: items.length });
});

export const listTenantOrders = asyncHandler(async (req, res) => {
  const items = await Order.find({ tenant: req.params.id }).sort('-createdAt').limit(100).populate('customer table');
  res.json({ items, total: items.length });
});

export const listTenantCustomers = asyncHandler(async (req, res) => {
  const items = await Customer.find({ tenant: req.params.id }).sort('-createdAt').limit(100);
  res.json({ items, total: items.length });
});
