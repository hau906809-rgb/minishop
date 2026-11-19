const { Product, Banner, Category } = require('../models');

// GET /api/home – dữ liệu tổng hợp cho trang chủ
async function home(req, res) {
  const [banners, categories, newProducts, bestSellers, saleProducts] = await Promise.all([
    Banner.find().sort({ createdAt: -1, id: -1 }).limit(3),
    Category.find().sort({ order: 1 }),
    Product.find().sort({ id: -1 }).limit(4),
    Product.find().sort({ sold: -1 }).limit(4),
    Product.find({ $expr: { $gt: ['$oldPrice', '$price'] } }).sort({ id: -1 }).limit(4)
  ]);
  res.json({ banners, categories, newProducts, bestSellers, saleProducts });
}

module.exports = { home };
