import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { RefreshToken, TokenBlacklist, hashOpaqueToken, createOpaqueToken } from '../models/AuthTokens.js';

const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_DAYS = Number(process.env.JWT_REFRESH_DAYS || 7);

function requireSecret() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
  return process.env.JWT_SECRET;
}

export function signAccessToken(user) {
  const jti = crypto.randomUUID();
  const token = jwt.sign(
    { id: user._id, role: user.role, tenant: user.tenant || null, jti, type: 'access' },
    requireSecret(),
    { expiresIn: ACCESS_EXPIRES }
  );
  return { token, jti };
}

export async function issueRefreshToken(user, meta = {}) {
  const raw = createOpaqueToken();
  const tokenHash = hashOpaqueToken(raw);
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
  await RefreshToken.create({
    user: user._id,
    tokenHash,
    expiresAt,
    userAgent: meta.userAgent,
    ip: meta.ip
  });
  return { refreshToken: raw, expiresAt };
}

export async function rotateRefreshToken(rawToken, meta = {}) {
  const tokenHash = hashOpaqueToken(rawToken);
  const existing = await RefreshToken.findOne({ tokenHash });
  if (!existing || existing.revokedAt || existing.expiresAt < new Date()) {
    if (existing?.revokedAt && existing.replacedByHash) {
      // Stolen refresh reuse — revoke all sessions for user
      await RefreshToken.updateMany({ user: existing.user, revokedAt: null }, { revokedAt: new Date() });
    }
    return null;
  }
  existing.revokedAt = new Date();
  const next = await issueRefreshToken({ _id: existing.user }, meta);
  existing.replacedByHash = hashOpaqueToken(next.refreshToken);
  await existing.save();
  return { userId: existing.user, ...next };
}

export async function revokeRefreshToken(rawToken) {
  if (!rawToken) return;
  const tokenHash = hashOpaqueToken(rawToken);
  await RefreshToken.updateOne({ tokenHash, revokedAt: null }, { revokedAt: new Date() });
}

export async function revokeAllRefreshTokens(userId) {
  await RefreshToken.updateMany({ user: userId, revokedAt: null }, { revokedAt: new Date() });
}

export async function blacklistAccessJti(jti, expSeconds) {
  if (!jti) return;
  const expiresAt = expSeconds
    ? new Date(expSeconds * 1000)
    : new Date(Date.now() + 15 * 60 * 1000);
  await TokenBlacklist.updateOne({ jti }, { jti, expiresAt }, { upsert: true });
}

export async function isAccessBlacklisted(jti) {
  if (!jti) return false;
  return Boolean(await TokenBlacklist.exists({ jti }));
}

/** @deprecated use signAccessToken — kept name for imports during migration */
export function signToken(user) {
  return signAccessToken(user).token;
}
