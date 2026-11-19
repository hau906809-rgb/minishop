// Controller CRUD dùng chung cho mọi bảng (GET list, GET by id/slug, POST, PUT, DELETE)
const byKey = (key) => (/^\d+$/.test(key) ? { id: Number(key) } : { slug: key });

module.exports = (Model) => ({
  list: async (req, res) => res.json(await Model.find().sort({ id: 1 })),
  get: async (req, res) => {
    const doc = await Model.findOne(byKey(req.params.key));
    doc ? res.json(doc) : res.status(404).json({ message: 'Không tìm thấy' });
  },
  create: async (req, res) => {
    const last = await Model.findOne().sort({ id: -1 });
    res.status(201).json(await Model.create({ ...req.body, id: (last?.id || 0) + 1 }));
  },
  update: async (req, res) => {
    const doc = await Model.findOneAndUpdate(byKey(req.params.key), req.body, { new: true });
    doc ? res.json(doc) : res.status(404).json({ message: 'Không tìm thấy' });
  },
  remove: async (req, res) => {
    const doc = await Model.findOneAndDelete(byKey(req.params.key));
    doc ? res.json({ message: 'Đã xóa' }) : res.status(404).json({ message: 'Không tìm thấy' });
  },
  byKey
});
