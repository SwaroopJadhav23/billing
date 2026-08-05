import mongoose from 'mongoose';
import { tenantRef } from './tenantRef.js';

const supplierSchema = new mongoose.Schema(
  {
    tenant: tenantRef,
    name: { type: String, required: true },
    mobile: String,
    email: String,
    address: String,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  { timestamps: true }
);

export const Supplier = mongoose.model('Supplier', supplierSchema);
