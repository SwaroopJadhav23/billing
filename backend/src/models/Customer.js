import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: String,
    totalOrders: { type: Number, default: 0 },
    totalSpending: { type: Number, default: 0 },
    lastOrderDate: Date
  },
  { timestamps: true }
);

customerSchema.index({ name: 'text', mobile: 'text', email: 'text' });

export const Customer = mongoose.model('Customer', customerSchema);
