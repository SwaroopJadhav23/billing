import crypto from 'node:crypto';
import { User } from '../models/User.js';
import { Tenant } from '../models/Tenant.js';
import { PasswordResetRequest } from '../models/AuthTokens.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { assertTenantActive } from '../utils/assertTenantActive.js';
import {
  blacklistAccessJti,
  issueRefreshToken,
  revokeAllRefreshTokens,
  revokeRefreshToken,
  rotateRefreshToken,
  signAccessToken
} from '../utils/tokens.js';
import { mergeTenantFeatures } from '../config/tenantFeatures.js';
import { ROLES } from '../config/roles.js';

const INACTIVE_ACCOUNT_MESSAGE = 'Account is inactive. Contact the administrator.';

async function attachTenantFeatures(user, tenant = null) {
  const safeUser = user.toObject ? user.toObject() : { ...user };
  delete safeUser.password;
  delete safeUser.loginPassword;
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

async function sendAuth(res, user, req) {
  const tenant = await assertTenantActive(user);
  const { token, jti } = signAccessToken(user);
  const refresh = await issueRefreshToken(user, {
    userAgent: req?.headers?.['user-agent'],
    ip: req?.ip
  });
  const safeUser = await attachTenantFeatures(user, tenant);
  res.json({
    token,
    accessToken: token,
    refreshToken: refresh.refreshToken,
    refreshExpiresAt: refresh.expiresAt,
    jti,
    user: safeUser
  });
}

async function rejectIfAccountInactive(user, email) {
  if (user) {
    if (user.status !== 'active') throw new ApiError(403, INACTIVE_ACCOUNT_MESSAGE);
    if (user.role !== ROLES.SUPER_ADMIN && user.tenant) {
      const tenant = await Tenant.findById(user.tenant).select('status');
      if (!tenant || tenant.status !== 'active') throw new ApiError(403, INACTIVE_ACCOUNT_MESSAGE);
    }
    return;
  }
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

  await sendAuth(res, user, req);
});

export const refresh = asyncHandler(async (req, res) => {
  const raw = req.body.refreshToken;
  if (!raw) throw new ApiError(400, 'refreshToken is required');
  const rotated = await rotateRefreshToken(raw, {
    userAgent: req.headers['user-agent'],
    ip: req.ip
  });
  if (!rotated) throw new ApiError(401, 'Invalid or expired refresh token');
  const user = await User.findById(rotated.userId);
  if (!user || user.status !== 'active') throw new ApiError(401, 'Invalid session');
  await assertTenantActive(user, { statusCode: 401 });
  const { token } = signAccessToken(user);
  res.json({
    token,
    accessToken: token,
    refreshToken: rotated.refreshToken,
    refreshExpiresAt: rotated.expiresAt,
    user: await attachTenantFeatures(user)
  });
});

export const me = asyncHandler(async (req, res) => {
  const tenant = await assertTenantActive(req.user);
  res.json(await attachTenantFeatures(req.user, tenant));
});

export const logout = asyncHandler(async (req, res) => {
  if (req.tokenPayload?.jti) {
    await blacklistAccessJti(req.tokenPayload.jti, req.tokenPayload.exp);
  }
  if (req.body?.refreshToken) {
    await revokeRefreshToken(req.body.refreshToken);
  } else if (req.user?._id) {
    await revokeAllRefreshTokens(req.user._id);
  }
  res.json({ message: 'Logged out' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  const generic = { message: 'If this account exists, a reset request was sent to the administrator.' };
  const user = await User.findOne({ email });
  if (!user) return res.json(generic);

  await PasswordResetRequest.create({
    user: user._id,
    tenant: user.tenant || null,
    email: user.email,
    status: 'pending'
  });

  // Never return reset tokens. Super Admin resolves via Generate Temporary Password.
  res.json(generic);
});

export const resetPassword = asyncHandler(async (req, res) => {
  // Legacy public reset-by-token disabled for security — Super Admin must reset.
  throw new ApiError(403, 'Password reset must be completed by your administrator.');
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || String(newPassword).length < 6) {
    throw new ApiError(400, 'Current password and a new password (min 6 chars) are required');
  }
  const user = await User.findById(req.user._id).select('+password');
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new ApiError(400, 'Current password is incorrect');
  }
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  await revokeAllRefreshTokens(user._id);
  res.json({ message: 'Password updated. Please sign in again.' });
});
