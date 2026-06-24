import mongoose from 'mongoose';
import { ROLES } from '../config/roles.js';

const staffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: String,
    email: String,
    role: { type: String, enum: Object.values(ROLES), required: true },
    joiningDate: Date,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    permissions: [{ type: String }]
  },
  { timestamps: true }
);

export const Staff = mongoose.model('Staff', staffSchema);
