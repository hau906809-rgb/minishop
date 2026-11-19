const mongoose = require('mongoose');

const opts = { versionKey: false, timestamps: true };

const Category = mongoose.model('Category', new mongoose.Schema({
  id: { type: Number, unique: true },
  name: String,
  slug: { type: String, unique: true },
  order: Number,
  icon: String
}, opts));

const Product = mongoose.model('Product', new mongoose.Schema({
  id: { type: Number, unique: true },
  name: String,
  slug: { type: String, unique: true },
  categoryId: Number,          // khóa ngoại -> Category.id
  price: Number,
  oldPrice: Number,
  image: String,
  description: String,
  hot: Boolean,
  stock: Number,
  sold: Number
}, opts));

const Blog = mongoose.model('Blog', new mongoose.Schema({
  id: { type: Number, unique: true },
  title: String,
  slug: { type: String, unique: true },
  summary: String,
  content: String,
  image: String
}, opts));

const Banner = mongoose.model('Banner', new mongoose.Schema({
  id: { type: Number, unique: true },
  title: String,
  slug: { type: String, unique: true },
  subtitle: String,
  image: String,
  link: String
}, opts));

module.exports = { Category, Product, Blog, Banner };
