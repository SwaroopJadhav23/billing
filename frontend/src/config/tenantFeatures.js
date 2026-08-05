export const TENANT_FEATURE_KEYS = [
  'dashboard',
  'pos',
  'tables',
  'orders',
  'menu',
  'customers',
  'inventory',
  'staff',
  'branches',
  'expenses',
  'reports',
  'settings'
];

export const TENANT_FEATURE_LABELS = {
  dashboard: 'Dashboard',
  pos: 'Billing POS',
  tables: 'Tables',
  orders: 'Orders',
  menu: 'Menu / Products',
  customers: 'Customers',
  inventory: 'Inventory',
  staff: 'Staff',
  branches: 'Branches',
  expenses: 'Expenses',
  reports: 'Reports',
  settings: 'Settings'
};

/** Maps app routes to tenant feature keys */
export const ROUTE_FEATURE_MAP = {
  '/dashboard': 'dashboard',
  '/pos': 'pos',
  '/tables': 'tables',
  '/orders': 'orders',
  '/menu': 'menu',
  '/customers': 'customers',
  '/inventory': 'inventory',
  '/staff': 'staff',
  '/branches': 'branches',
  '/expenses': 'expenses',
  '/reports': 'reports',
  '/settings': 'settings'
};

export function defaultTenantFeatures(overrides = {}) {
  return TENANT_FEATURE_KEYS.reduce((acc, key) => {
    acc[key] = overrides[key] !== undefined ? Boolean(overrides[key]) : true;
    return acc;
  }, {});
}

export function hasFeature(features, featureKey) {
  if (!featureKey) return true;
  if (!features) return true;
  return features[featureKey] !== false;
}
