import mongoose from 'mongoose';
import { tenantRef } from './tenantRef.js';

const paymentSchema = new mongoose.Schema(
  {
    tenant: tenantRef,
    bill: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill' },
    amount: { type: Number, required: true },
    mode: { type: String, enum: ['cash', 'upi', 'card'], required: true },
    reference: String,
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'paid' },
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);
