import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    materialName: { type: String, required: true, trim: true },
    unit: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    purchaseCost: { type: Number, default: 0 },
    currentStock: { type: Number, default: 0 },
    minimumStockLevel: { type: Number, default: 0 },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    transactions: [{ type: { type: String, enum: ['stock-in', 'stock-out', 'purchase'] }, quantity: Number, cost: Number, at: Date }]
  },
  { timestamps: true }
);

export const Inventory = mongoose.model('Inventory', inventorySchema);
