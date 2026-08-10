const ALLOWED_FILTER_KEYS = new Set([
  'status',
  'branch',
  'category',
  'categoryName',
  'type',
  'paymentMode',
  'role',
  'table',
  'customer',
  'supplier',
  'isAvailable',
  'materialName',
  'key',
  'order',
  'floor'
]);

function isPlainValue(value) {
  if (value == null) return true;
  const t = typeof value;
  return t === 'string' || t === 'number' || t === 'boolean';
}

/** Strip operator injection / unknown keys from query filters */
export function sanitizeQueryFilters(raw = {}) {
  const safe = {};
  for (const [key, value] of Object.entries(raw)) {
    if (key.startsWith('$')) continue;
    if (!ALLOWED_FILTER_KEYS.has(key)) continue;
    if (!isPlainValue(value)) continue;
    if (typeof value === 'string' && value.includes('$')) continue;
    safe[key] = value;
  }
  return safe;
}
