import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    category: { type: String, enum: ['Electricity', 'Rent', 'Salary', 'Purchases', 'Maintenance', 'Miscellaneous'], required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export const Expense = mongoose.model('Expense', expenseSchema);
