import { Tenant } from '../models/Tenant.js';
import { ROLES } from '../config/roles.js';
import { ApiError } from './apiError.js';

export async function assertTenantActive(user, { statusCode = 403 } = {}) {
  if (!user || user.role === ROLES.SUPER_ADMIN || !user.tenant) return null;
  const tenant = await Tenant.findById(user.tenant).select('name status features');
  if (!tenant) throw new ApiError(statusCode, 'Store not found for this account');
  if (tenant.status !== 'active') {
    throw new ApiError(statusCode, 'Account is inactive. Contact the administrator.');
  }
  return tenant;
}
