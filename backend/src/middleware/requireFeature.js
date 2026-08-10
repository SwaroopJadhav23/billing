import { TENANT_FEATURE_KEYS } from '../config/tenantFeatures.js';
import { ROLES } from '../config/roles.js';
import { Tenant } from '../models/Tenant.js';
import { ApiError } from '../utils/apiError.js';
import { mergeTenantFeatures } from '../config/tenantFeatures.js';

/** Map first URL segment after /api to feature key */
export const PATH_FEATURE_MAP = {
  dashboard: 'dashboard',
  'menu-items': 'menu',
  'menu-categories': 'menu',
  tables: 'tables',
  customers: 'customers',
  inventory: 'inventory',
  suppliers: 'inventory',
  staff: 'staff',
  branches: 'branches',
  expenses: 'expenses',
  reports: 'reports',
  settings: 'settings',
  orders: 'orders',
  bills: 'pos',
  payments: 'pos',
  kots: 'orders',
  restaurants: 'settings'
};

export function requireFeature(featureKey) {
  return async (req, res, next) => {
    try {
      if (req.user?.role === ROLES.SUPER_ADMIN) return next();
      if (!featureKey) return next();
      if (!req.user?.tenant) throw new ApiError(403, 'No store assigned to this user');

      const tenant = await Tenant.findById(req.user.tenant).select('features status');
      if (!tenant || tenant.status !== 'active') {
        throw new ApiError(403, 'Account is inactive. Contact the administrator.');
      }
      const features = mergeTenantFeatures(tenant.features?.toObject?.() || tenant.features || {});
      if (features[featureKey] === false) {
        throw new ApiError(403, `Module "${featureKey}" is disabled for this store`);
      }
      req.tenantFeatures = features;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireFeatureFromPath(req, res, next) {
  const segment = req.path.split('/').filter(Boolean)[0];
  const featureKey = PATH_FEATURE_MAP[segment];
  if (!featureKey || !TENANT_FEATURE_KEYS.includes(featureKey)) return next();
  return requireFeature(featureKey)(req, res, next);
}
