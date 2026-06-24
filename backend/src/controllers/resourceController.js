import { asyncHandler } from '../utils/asyncHandler.js';

export function resourceController(Model, options = {}) {
  const populate = options.populate || '';

  return {
    list: asyncHandler(async (req, res) => {
      const { search, status, page = 1, limit = 20, sort = '-createdAt', ...filters } = req.query;
      const query = { ...filters };
      if (status) query.status = status;
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
      const item = await Model.findById(req.params.id).populate(populate);
      if (!item) return res.status(404).json({ message: 'Resource not found' });
      res.json(item);
    }),

    create: asyncHandler(async (req, res) => {
      const item = await Model.create(req.body);
      res.status(201).json(item);
    }),

    update: asyncHandler(async (req, res) => {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!item) return res.status(404).json({ message: 'Resource not found' });
      res.json(item);
    }),

    remove: asyncHandler(async (req, res) => {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) return res.status(404).json({ message: 'Resource not found' });
      res.json({ message: 'Deleted successfully' });
    })
  };
}
