const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { success, failure } = require('../utils/apiResponse');
const { calculateCartTotals } = require('../utils/calculateTotals');

const POPULATE_FIELDS = 'name price mrp stock images slug isActive brand';

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate('items.product', POPULATE_FIELDS);
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    return cart;
  }

  // Permanently drop items whose product was deleted or deactivated.
  // Without this, ghost items linger in the DB and block checkout even though
  // the frontend cart looks clean.
  const beforeCount = cart.items.length;
  cart.items = cart.items.filter((i) => i.product && i.product.isActive !== false);
  if (cart.items.length !== beforeCount) {
    await cart.save();
  }
  return cart;
}

function buildResponse(cart) {
  const totals = calculateCartTotals(cart.items);
  return { items: cart.items, ...totals };
}

async function getCart(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user._id);
    res.json(success('Cart fetched.', buildResponse(cart)));
  } catch (err) {
    next(err);
  }
}

async function addItem(req, res, next) {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json(failure('productId is required.'));

    const qty = parseInt(quantity);
    if (!Number.isFinite(qty) || qty < 1) {
      return res.status(400).json(failure('Quantity must be at least 1.'));
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) return res.status(404).json(failure('Product not found.'));

    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find((i) => i.product._id.toString() === productId);
    const desired = existing ? existing.quantity + qty : qty;

    if (desired > product.stock) {
      return res.status(400).json(failure(`Only ${product.stock} unit(s) available.`));
    }

    if (existing) {
      existing.quantity = desired;
      existing.priceSnapshot = product.price; // refresh price
    } else {
      cart.items.push({ product: productId, quantity: qty, priceSnapshot: product.price });
    }

    await cart.save();
    await cart.populate('items.product', POPULATE_FIELDS);
    res.json(success('Item added to cart.', buildResponse(cart)));
  } catch (err) {
    next(err);
  }
}

async function updateItem(req, res, next) {
  try {
    const { productId } = req.params;
    const quantity = parseInt(req.body.quantity);

    if (!Number.isFinite(quantity) || quantity < 1) {
      return res.status(400).json(failure('Quantity must be at least 1.'));
    }

    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.find((i) => i.product._id.toString() === productId);
    if (!item) return res.status(404).json(failure('Item not in cart.'));

    const product = await Product.findById(productId);
    if (!product || !product.isActive) return res.status(404).json(failure('Product not found.'));
    if (quantity > product.stock) {
      return res.status(400).json(failure(`Only ${product.stock} unit(s) available.`));
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product', POPULATE_FIELDS);
    res.json(success('Cart updated.', buildResponse(cart)));
  } catch (err) {
    next(err);
  }
}

async function removeItem(req, res, next) {
  try {
    const { productId } = req.params;
    const cart = await getOrCreateCart(req.user._id);
    cart.items = cart.items.filter((i) => i.product._id.toString() !== productId);
    await cart.save();
    await cart.populate('items.product', POPULATE_FIELDS);
    res.json(success('Item removed.', buildResponse(cart)));
  } catch (err) {
    next(err);
  }
}

async function clearCart(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    res.json(success('Cart cleared.', buildResponse(cart)));
  } catch (err) {
    next(err);
  }
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
