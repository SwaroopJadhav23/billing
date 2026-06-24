import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    name: String,
    price: Number,
    gstPercentage: Number,
    quantity: { type: Number, default: 1 },
    note: String
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    type: { type: String, enum: ['dine-in', 'takeaway', 'delivery'], default: 'dine-in' },
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    items: [orderItemSchema],
    status: { type: String, enum: ['created', 'preparing', 'ready', 'delivered', 'cancelled', 'completed'], default: 'created' },
    timeline: [{ status: String, at: { type: Date, default: Date.now }, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    gstTotal: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
