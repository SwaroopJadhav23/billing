import crypto from 'node:crypto';
import { User } from '../models/User.js';
import { Tenant } from '../models/Tenant.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { assertTenantActive } from '../utils/assertTenantActive.js';
import { signToken } from '../utils/tokens.js';
import { mergeTenantFeatures } from '../config/tenantFeatures.js';
import { ROLES } from '../config/roles.js';

const INACTIVE_ACCOUNT_MESSAGE = 'Account is inactive. Contact the administrator.';

async function attachTenantFeatures(user, tenant = null) {
  const safeUser = user.toObject ? user.toObject() : { ...user };
  delete safeUser.password;
  if (safeUser.role === ROLES.SUPER_ADMIN || !safeUser.tenant) {
    safeUser.features = null;
    return safeUser;
  }
  const store = tenant || await Tenant.findById(safeUser.tenant).select('features name status');
  safeUser.tenantInfo = store
    ? { _id: store._id, name: store.name, status: store.status }
    : null;
  safeUser.features = mergeTenantFeatures(store?.features?.toObject?.() || store?.features || {});
  return safeUser;
}

const sendAuth = async (res, user) => {
  const tenant = await assertTenantActive(user);
  const token = signToken(user);
  const safeUser = await attachTenantFeatures(user, tenant);
  res.json({ token, user: safeUser });
};

async function rejectIfAccountInactive(user, email) {
  if (user) {
    if (user.status !== 'active') {
      throw new ApiError(403, INACTIVE_ACCOUNT_MESSAGE);
    }
    if (user.role !== ROLES.SUPER_ADMIN && user.tenant) {
      const tenant = await Tenant.findById(user.tenant).select('status');
      if (!tenant || tenant.status !== 'active') {
        throw new ApiError(403, INACTIVE_ACCOUNT_MESSAGE);
      }
    }
    return;
  }

  // Store contact email (or related) used at login — still show inactive clearly
  const tenantByEmail = await Tenant.findOne({ email: String(email).toLowerCase() }).select('status');
  if (tenantByEmail && tenantByEmail.status !== 'active') {
    throw new ApiError(403, INACTIVE_ACCOUNT_MESSAGE);
  }
}

export const login = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  const { password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  await rejectIfAccountInactive(user, email);

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  await sendAuth(res, user);
});

export const me = asyncHandler(async (req, res) => {
  const tenant = await assertTenantActive(req.user);
  res.json(await attachTenantFeatures(req.user, tenant));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email).toLowerCase() });
  if (!user) return res.json({ message: 'If the email exists, a reset token has been generated' });
  const token = crypto.randomBytes(24).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30);
  await user.save({ validateBeforeSave: false });
  res.json({ message: 'Reset token generated', resetToken: token });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.body.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: new Date() }
  });
  if (!user) throw new ApiError(400, 'Invalid or expired reset token');
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  await sendAuth(res, user);
});
