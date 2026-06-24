import { Kot } from '../models/Kot.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const updateKotStatus = asyncHandler(async (req, res) => {
  const kot = await Kot.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!kot) return res.status(404).json({ message: 'KOT not found' });
  req.app.get('io')?.emit('kot:updated', kot);
  res.json(kot);
});
