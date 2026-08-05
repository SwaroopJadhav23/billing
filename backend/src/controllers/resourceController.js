import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../config/roles.js';
import { applyTenantFilter, withTenantOnCreate } from '../utils/tenantScope.js';
import { ApiError } from '../utils/apiError.js';

export function resourceController(Model, options = {}) {
  const populate = options.populate || '';
  const scoped = options.scoped !== false;

  return {
    list: asyncHandler(async (req, res) => {
      const { search, status, page = 1, limit = 20, sort = '-createdAt', tenantId, ...filters } = req.query;
      let query = { ...filters };
      if (status) query.status = status;
      if (scoped) query = applyTenantFilter(req, query);
      if (search && Model.schema.indexes().some(([idx]) => Object.values(idx).includes('text'))) {
        query.$text = { $search: search };
      }
      const skip = (Number(page) - 1) * Number(limit);
      const [items, total] = await Promise.all([
        Model.find(query).populate(populate).sort(sort).skip(skip).limit(Number(limit)),
        Model.countDocuments(query)
      ]);
      res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) || 1 });
    }),

    get: asyncHandler(async (req, res) => {
      const query = { _id: req.params.id };
      if (scoped) applyTenantFilter(req, query);
      const item = await Model.findOne(query).populate(populate);
      if (!item) return res.status(404).json({ message: 'Resource not found' });
      res.json(item);
    }),

    create: asyncHandler(async (req, res) => {
      if (scoped && req.user?.role !== ROLES.SUPER_ADMIN && !req.user?.tenant) {
        throw new ApiError(403, 'No store assigned to this user');
      }
      const payload = scoped ? withTenantOnCreate(req, req.body) : req.body;
      const item = await Model.create(payload);
      res.status(201).json(item);
    }),

    update: asyncHandler(async (req, res) => {
      const query = { _id: req.params.id };
      if (scoped) applyTenantFilter(req, query);
      const { tenant, ...safeBody } = req.body;
      const item = await Model.findOneAndUpdate(query, safeBody, { new: true, runValidators: true });
      if (!item) return res.status(404).json({ message: 'Resource not found' });
      res.json(item);
    }),

    remove: asyncHandler(async (req, res) => {
      const query = { _id: req.params.id };
      if (scoped) applyTenantFilter(req, query);
      const item = await Model.findOneAndDelete(query);
      if (!item) return res.status(404).json({ message: 'Resource not found' });
      res.json({ message: 'Deleted successfully' });
    })
  };
}
