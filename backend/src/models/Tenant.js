import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    businessType: { type: String, enum: ['kirana', 'bakery', 'restaurant', 'cafe', 'other'], default: 'other' },
    ownerName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    mobile: { type: String, trim: true },
    address: String,
    gstNumber: String,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  { timestamps: true }
);

export const Tenant = mongoose.model('Tenant', tenantSchema);
