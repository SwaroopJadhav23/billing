import express from 'express';
import { PERMISSIONS } from '../config/roles.js';
import { resourceController } from '../controllers/resourceController.js';
import { allowRoles, protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { MenuItem } from '../models/MenuItem.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();
const controller = resourceController(MenuItem);

const imageUrl = (req, file) => {
  if (!file) return undefined;
  return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
};

router.use(protect);

router.get('/', allowRoles(...PERMISSIONS.menu), controller.list);
router.get('/:id', allowRoles(...PERMISSIONS.menu), controller.get);

router.post('/', allowRoles(...PERMISSIONS.menu), upload.single('imageFile'), asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    price: Number(req.body.price),
    gstPercentage: Number(req.body.gstPercentage || 0),
    isAvailable: req.body.isAvailable === undefined ? true : req.body.isAvailable === 'true' || req.body.isAvailable === true
  };
  const uploadedImage = imageUrl(req, req.file);
  if (uploadedImage) payload.image = uploadedImage;
  const item = await MenuItem.create(payload);
  res.status(201).json(item);
}));

router.put('/:id', allowRoles(...PERMISSIONS.menu), upload.single('imageFile'), asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    price: Number(req.body.price),
    gstPercentage: Number(req.body.gstPercentage || 0),
    isAvailable: req.body.isAvailable === undefined ? true : req.body.isAvailable === 'true' || req.body.isAvailable === true
  };
  const uploadedImage = imageUrl(req, req.file);
  if (uploadedImage) payload.image = uploadedImage;

  const item = await MenuItem.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: 'Resource not found' });
  res.json(item);
}));

router.delete('/:id', allowRoles(...PERMISSIONS.menu), controller.remove);

export default router;
