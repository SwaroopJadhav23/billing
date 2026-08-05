import mongoose from 'mongoose';
import { tenantRef } from './tenantRef.js';

const restaurantSchema = new mongoose.Schema(
  {
    tenant: tenantRef,
    name: { type: String, required: true },
    address: String,
    gstNumber: String,
    phone: String,
    logo: String
  },
  { timestamps: true }
);

export const Restaurant = mongoose.model('Restaurant', restaurantSchema);
