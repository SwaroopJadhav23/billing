import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['daily-sales', 'weekly-sales', 'monthly-sales', 'gst', 'item-wise', 'category-wise', 'revenue', 'expense', 'profit-loss'],
      required: true
    },
    filters: mongoose.Schema.Types.Mixed,
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    data: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export const Report = mongoose.model('Report', reportSchema);
