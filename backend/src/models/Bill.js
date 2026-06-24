import mongoose from 'mongoose';

const billSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    items: [{ name: String, quantity: Number, price: Number, gstPercentage: Number }],
    subtotal: Number,
    discount: Number,
    gstTotal: Number,
    serviceCharge: Number,
    grandTotal: Number,
    paymentMode: { type: String, enum: ['cash', 'upi', 'card'], required: true },
    paidAmount: Number,
    restaurant: {
      name: String,
      address: String,
      gstNumber: String
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export const Bill = mongoose.model('Bill', billSchema);
