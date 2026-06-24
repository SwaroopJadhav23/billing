import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuCategory' },
    categoryName: { type: String, enum: ['Starters', 'Main Course', 'Beverages', 'Desserts'], required: true },
    description: String,
    price: { type: Number, required: true, min: 0 },
    gstPercentage: { type: Number, default: 5, min: 0 },
    image: String,
    isAvailable: { type: Boolean, default: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  { timestamps: true }
);

menuItemSchema.index({ name: 'text', categoryName: 'text' });

export const MenuItem = mongoose.model('MenuItem', menuItemSchema);
