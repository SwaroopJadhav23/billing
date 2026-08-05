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
  '/': [ROLES.MANAGER],
  '/pos': [ROLES.MANAGER, ROLES.CASHIER, ROLES.WAITER],
  '/tables': [ROLES.MANAGER, ROLES.WAITER],
  '/orders': [ROLES.MANAGER, ROLES.CASHIER, ROLES.WAITER],
  '/menu': [ROLES.MANAGER],
  '/customers': [ROLES.MANAGER, ROLES.CASHIER],
  '/inventory': [ROLES.MANAGER],
  '/staff': [ROLES.MANAGER],
  '/expenses': [ROLES.MANAGER],
  '/reports': [ROLES.MANAGER],
  '/settings': [ROLES.MANAGER]
};

export function canAccessRoute(pathname, role) {
  if (!role) return false;
  if (pathname.startsWith('/super-admin/tenants/')) {
    return routePermissions['/super-admin/tenants/:id']?.includes(role);
  }
  return routePermissions[pathname]?.includes(role);
}

export function homePathForRole(role) {
  return role === ROLES.SUPER_ADMIN ? '/super-admin' : '/pos';
}
