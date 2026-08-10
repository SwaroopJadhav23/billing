import crypto from 'node:crypto';
import mongoose from 'mongoose';

const tokenBlacklistSchema = new mongoose.Schema(
  {
    jti: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema);

const refreshTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revokedAt: Date,
    replacedByHash: String,
    userAgent: String,
    ip: String
  },
  { timestamps: true }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

const passwordResetRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', default: null },
    email: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date
  },
  { timestamps: true }
);

export const PasswordResetRequest = mongoose.model('PasswordResetRequest', passwordResetRequestSchema);

export function hashOpaqueToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function createOpaqueToken(bytes = 48) {
  return crypto.randomBytes(bytes).toString('hex');
}
