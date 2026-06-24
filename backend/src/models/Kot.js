import mongoose from 'mongoose';

const kotSchema = new mongoose.Schema(
  {
    kotNumber: { type: String, required: true, unique: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
    items: [{ name: String, quantity: Number, note: String }],
    status: { type: String, enum: ['new', 'preparing', 'ready', 'served'], default: 'new' },
    preparationTime: { type: Number, default: 15 },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export const Kot = mongoose.model('Kot', kotSchema);
