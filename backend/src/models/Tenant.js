import mongoose from 'mongoose';
import { TENANT_FEATURE_KEYS } from '../config/tenantFeatures.js';

const featureFields = Object.fromEntries(
  TENANT_FEATURE_KEYS.map((key) => [key, { type: Boolean, default: true }])
);

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    businessType: { type: String, enum: ['kirana', 'bakery', 'restaurant', 'cafe', 'other'], default: 'other' },
    ownerName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    mobile: { type: String, trim: true },
    address: String,
    gstNumber: String,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    features: {
      type: new mongoose.Schema(featureFields, { _id: false }),
      default: () => Object.fromEntries(TENANT_FEATURE_KEYS.map((key) => [key, true]))
    }
  },
  { timestamps: true }
);

export const Tenant = mongoose.model('Tenant', tenantSchema);
