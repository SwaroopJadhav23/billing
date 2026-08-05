import mongoose from 'mongoose';
import { tenantRef } from './tenantRef.js';

const tableSchema = new mongoose.Schema(
  {
    tenant: tenantRef,
    name: { type: String, required: true, trim: true },
    capacity: { type: Number, default: 4 },
    floor: { type: String, default: 'Main' },
    status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' },
    mergedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Table' }],
    currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
  },
  { timestamps: true }
);

export const Table = mongoose.model('Table', tableSchema);
