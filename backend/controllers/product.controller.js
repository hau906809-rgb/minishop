const { Product, Category } = require('../models');
const crud = require('./crud')(Product);

// GET /api/products?search=&categorySlug=&sort=price-asc|price-desc|newest|best-seller&limit=&hot=true&sale=true
async function list(req, res) {
  const { search, categorySlug, sort, limit, hot, sale } = req.query;
  const filter = {};
  if (search) filter.name = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  if (categorySlug && categorySlug !== 'tat-ca') {
    const cat = await Category.findOne({ slug: categorySlug });
    if (!cat) return res.json([]);
    filter.categoryId = cat.id;
  }
  if (hot === 'true') filter.hot = true;
  if (sale === 'true') filter.$expr = { $gt: ['$oldPrice', '$price'] };
  const sorts = { 'price-asc': { price: 1 }, 'price-desc': { price: -1 }, newest: { id: -1 }, 'best-seller': { sold: -1 } };
  let q = Product.find(filter).sort(sorts[sort] || { id: 1 });
  if (limit) q = q.limit(Number(limit));
  res.json(await q);
}

module.exports = { ...crud, list };
