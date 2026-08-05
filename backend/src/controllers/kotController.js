import { Kot } from '../models/Kot.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../config/roles.js';

export const updateKotStatus = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user?.role !== ROLES.SUPER_ADMIN) filter.tenant = req.user.tenant;
  const kot = await Kot.findOneAndUpdate(filter, { status: req.body.status }, { new: true });
  if (!kot) return res.status(404).json({ message: 'KOT not found' });
  req.app.get('io')?.emit('kot:updated', kot);
  res.json(kot);
});
