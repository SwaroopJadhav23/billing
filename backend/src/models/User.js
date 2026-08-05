import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { ROLES } from '../config/roles.js';
import { tenantRef } from './tenantRef.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    /** Plaintext copy for Super Admin handover only — never returned on normal auth */
    loginPassword: { type: String, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.CASHIER },
    tenant: tenantRef,
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null },
    permissions: [{ type: String }],
    joiningDate: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', userSchema);
