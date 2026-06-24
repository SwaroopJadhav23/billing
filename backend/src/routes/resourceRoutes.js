import express from 'express';
import { resourceController } from '../controllers/resourceController.js';
import { protect, allowRoles } from '../middleware/auth.js';
import { ROLES } from '../config/roles.js';

export function crudRoutes(Model, roles = Object.values(ROLES), options = {}) {
  const router = express.Router();
  const controller = resourceController(Model, options);
  router.use(protect);
  router.get('/', allowRoles(...roles), controller.list);
  router.post('/', allowRoles(...roles), controller.create);
  router.get('/:id', allowRoles(...roles), controller.get);
  router.put('/:id', allowRoles(...roles), controller.update);
  router.delete('/:id', allowRoles(...roles), controller.remove);
  return router;
}
