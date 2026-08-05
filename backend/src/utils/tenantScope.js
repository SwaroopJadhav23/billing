import { ROLES } from '../config/roles.js';

export function resolveTenantId(req) {
  if (req.user?.role === ROLES.SUPER_ADMIN) {
    return req.query.tenantId || req.body?.tenant || null;
  }
  return req.user?.tenant || null;
}

export function applyTenantFilter(req, query = {}) {
  if (req.user?.role === ROLES.SUPER_ADMIN) {
    if (req.query.tenantId) query.tenant = req.query.tenantId;
    return query;
  }
  if (req.user?.tenant) query.tenant = req.user.tenant;
  return query;
}

export function withTenantOnCreate(req, payload = {}) {
  if (req.user?.role === ROLES.SUPER_ADMIN) {
    if (payload.tenant || req.body?.tenant) return { ...payload, tenant: payload.tenant || req.body.tenant };
    return payload;
  }
  return { ...payload, tenant: req.user?.tenant || null };
}
