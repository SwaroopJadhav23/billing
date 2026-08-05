import mongoose from 'mongoose';
import { tenantRef } from './tenantRef.js';

const menuCategorySchema = new mongoose.Schema(
  {
    tenant: tenantRef,
    name: { type: String, required: true, trim: true },
    description: String,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  { timestamps: true }
);

export const MenuCategory = mongoose.model('MenuCategory', menuCategorySchema);
