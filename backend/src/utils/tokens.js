import jwt from 'jsonwebtoken';

export function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, tenant: user.tenant || null },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}
