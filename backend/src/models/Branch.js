import mongoose from 'mongoose';
import { tenantRef } from './tenantRef.js';

const branchSchema = new mongoose.Schema(
  {
    tenant: { ...tenantRef, required: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    address: String,
    mobile: { type: String, trim: true },
    managerName: { type: String, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  { timestamps: true }
);

branchSchema.index({ tenant: 1, name: 1 });

export const Branch = mongoose.model('Branch', branchSchema);
