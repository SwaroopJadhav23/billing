import { ROUTE_FEATURE_MAP, hasFeature } from '../config/tenantFeatures';

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
  WAITER: 'waiter',
  KITCHEN_STAFF: 'kitchen_staff'
};

/** Store day-to-day modules — Super Admin tracks via Clients panel instead */
export const routePermissions = {
  '/super-admin': [ROLES.SUPER_ADMIN],
  '/super-admin/tenants/:id': [ROLES.SUPER_ADMIN],
  '/dashboard': [ROLES.MANAGER],
  '/pos': [ROLES.MANAGER, ROLES.CASHIER, ROLES.WAITER],
  '/tables': [ROLES.MANAGER, ROLES.WAITER],
  '/orders': [ROLES.MANAGER, ROLES.CASHIER, ROLES.WAITER],
  '/menu': [ROLES.MANAGER],
  '/customers': [ROLES.MANAGER, ROLES.CASHIER],
  '/inventory': [ROLES.MANAGER],
  '/staff': [ROLES.MANAGER],
  '/branches': [ROLES.MANAGER],
  '/expenses': [ROLES.MANAGER],
  '/reports': [ROLES.MANAGER],
  '/settings': [ROLES.MANAGER]
};

const STORE_HOME_FALLBACKS = ['/pos', '/dashboard', '/menu', '/orders', '/customers', '/inventory', '/tables', '/staff', '/branches', '/expenses', '/reports', '/settings'];

export function canAccessRoute(pathname, role, features) {
  if (!role) return false;
  if (pathname.startsWith('/super-admin/tenants/')) {
    return routePermissions['/super-admin/tenants/:id']?.includes(role);
  }
  if (!routePermissions[pathname]?.includes(role)) return false;
  const featureKey = ROUTE_FEATURE_MAP[pathname];
  if (role !== ROLES.SUPER_ADMIN && featureKey && !hasFeature(features, featureKey)) return false;
  return true;
}

export function homePathForRole(role, features) {
  if (role === ROLES.SUPER_ADMIN) return '/super-admin';
  for (const path of STORE_HOME_FALLBACKS) {
    if (canAccessRoute(path, role, features)) return path;
  }
  return '/pos';
}
