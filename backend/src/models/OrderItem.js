import mongoose from 'mongoose';
import { tenantRef } from './tenantRef.js';

const orderItemSchema = new mongoose.Schema(
  {
    tenant: tenantRef,
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    gstPercentage: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 },
    note: String
  },
  { timestamps: true }
);

export const OrderItem = mongoose.model('OrderItem', orderItemSchema);
