import { ROLES } from '../config/roles.js';
import { ApiError } from './apiError.js';

export function resolveTenantId(req) {
  if (req.user?.role === ROLES.SUPER_ADMIN) {
    return req.query.tenantId || req.body?.tenant || null;
  }
  if (!req.user?.tenant) throw new ApiError(403, 'No store assigned to this user');
  return req.user.tenant;
}

export function applyTenantFilter(req, query = {}) {
  if (req.user?.role === ROLES.SUPER_ADMIN) {
    if (req.query.tenantId) query.tenant = req.query.tenantId;
    return query;
  }
  if (!req.user?.tenant) throw new ApiError(403, 'No store assigned to this user');
  query.tenant = req.user.tenant;
  return query;
}

export function withTenantOnCreate(req, payload = {}) {
  if (req.user?.role === ROLES.SUPER_ADMIN) {
    const tenant = payload.tenant || req.body?.tenant;
    if (!tenant) throw new ApiError(400, 'tenant is required');
    return { ...payload, tenant };
  }
  if (!req.user?.tenant) throw new ApiError(403, 'No store assigned to this user');
  return { ...payload, tenant: req.user.tenant };
}

export function requireTenantId(req) {
  return resolveTenantId(req);
}
