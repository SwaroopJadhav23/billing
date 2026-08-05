import mongoose from 'mongoose';
import { tenantRef } from './tenantRef.js';

const settingSchema = new mongoose.Schema(
  {
    tenant: tenantRef,
    key: { type: String, required: true },
    value: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

settingSchema.index({ tenant: 1, key: 1 }, { unique: true });

export const Setting = mongoose.model('Setting', settingSchema);
