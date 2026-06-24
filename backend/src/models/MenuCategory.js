import mongoose from 'mongoose';

const menuCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: String,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  { timestamps: true }
);

export const MenuCategory = mongoose.model('MenuCategory', menuCategorySchema);
