const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { success, failure } = require('../utils/apiResponse');

const POPULATE = {
  path: 'products',
  match: { isActive: true },
  select: 'name price mrp stock images slug brand ratingAverage ratingCount',
};

async function getOrCreate(userId) {
  let w = await Wishlist.findOne({ user: userId }).populate(POPULATE);
  if (!w) w = await Wishlist.create({ user: userId, products: [] });
  return w;
}

async function getWishlist(req, res, next) {
  try {
    const wishlist = await getOrCreate(req.user._id);
    const products = wishlist.products.filter(Boolean);
    res.json(success('Wishlist fetched.', { products }));
  } catch (err) {
    next(err);
  }
}

async function addToWishlist(req, res, next) {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product || !product.isActive) return res.status(404).json(failure('Product not found.'));

    const wishlist = await getOrCreate(req.user._id);
    const exists = wishlist.products.some((p) => p && p._id.toString() === productId);
    if (exists) return res.status(400).json(failure('Already in wishlist.'));

    wishlist.products.push(productId);
    await wishlist.save();
    await wishlist.populate(POPULATE);
    res.json(success('Added to wishlist.', { products: wishlist.products.filter(Boolean) }));
  } catch (err) {
    next(err);
  }
}

async function removeFromWishlist(req, res, next) {
  try {
    const { productId } = req.params;
    const wishlist = await getOrCreate(req.user._id);
    wishlist.products = wishlist.products.filter(
      (p) => p && p._id.toString() !== productId
    );
    await wishlist.save();
    res.json(success('Removed from wishlist.', { products: wishlist.products.filter(Boolean) }));
  } catch (err) {
    next(err);
  }
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
