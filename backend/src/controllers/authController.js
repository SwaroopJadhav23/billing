import crypto from 'node:crypto';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { signToken } from '../utils/tokens.js';

const sendAuth = (res, user) => {
  const token = signToken(user);
  const safeUser = user.toObject ? user.toObject() : user;
  delete safeUser.password;
  res.json({ token, user: safeUser });
};

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) throw new ApiError(401, 'Invalid email or password');
  if (user.status !== 'active') throw new ApiError(403, 'Your account is inactive');
  sendAuth(res, user);
});

export const me = asyncHandler(async (req, res) => {
  res.json(req.user);
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
  sendAuth(res, user);
});
