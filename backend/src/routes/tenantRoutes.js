import express from 'express';
import { ROLES } from '../config/roles.js';
import { allowRoles, protect } from '../middleware/auth.js';
import {
  createTenant,
  getTenant,
  listTenantBills,
  listTenantCustomers,
  listTenantInventory,
  listTenantOrders,
  listTenants,
  updateTenant
} from '../controllers/tenantController.js';

const router = express.Router();

router.use(protect, allowRoles(ROLES.SUPER_ADMIN));

router.get('/', listTenants);
router.post('/', createTenant);
router.get('/:id', getTenant);
router.patch('/:id', updateTenant);
router.get('/:id/bills', listTenantBills);
router.get('/:id/inventory', listTenantInventory);
router.get('/:id/orders', listTenantOrders);
router.get('/:id/customers', listTenantCustomers);

export default router;
