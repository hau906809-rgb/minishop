const express = require('express');
const { Category, Blog, Banner } = require('../models');
const productCtrl = require('../controllers/product.controller');
const homeCtrl = require('../controllers/home.controller');
const crud = require('../controllers/crud');

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function resource(ctrl) {
  const r = express.Router();
  r.get('/', wrap(ctrl.list));
  r.get('/:key', wrap(ctrl.get));       // :key = id (số) hoặc slug
  r.post('/', wrap(ctrl.create));
  r.put('/:key', wrap(ctrl.update));
  r.delete('/:key', wrap(ctrl.remove));
  return r;
}

const router = express.Router();
router.get('/home', wrap(homeCtrl.home));
router.use('/products', resource(productCtrl));
router.use('/categories', resource(crud(Category)));
router.use('/blogs', resource(crud(Blog)));
router.use('/banners', resource(crud(Banner)));

module.exports = router;
