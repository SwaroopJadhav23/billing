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

export function defaultTenantFeatures(overrides = {}) {
  return TENANT_FEATURE_KEYS.reduce((acc, key) => {
    acc[key] = overrides[key] !== undefined ? Boolean(overrides[key]) : true;
    return acc;
  }, {});
}

export function mergeTenantFeatures(features = {}) {
  return defaultTenantFeatures(features);
}
