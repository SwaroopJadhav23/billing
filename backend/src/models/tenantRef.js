import mongoose from 'mongoose';

export const tenantRef = {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Tenant',
  index: true,
  default: null
};
