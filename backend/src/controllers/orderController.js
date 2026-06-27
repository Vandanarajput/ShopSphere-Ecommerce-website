const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { success, failure } = require('../utils/apiResponse');
const generateOrderNumber = require('../utils/orderNumber');

// Allowed status transitions (doc §16.3)
const STATUS_FLOW = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: ['refunded'],
  refunded: [],
};

function validateAddress(addr) {
  if (!addr) return 'Shipping address is required.';
  const required = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
  for (const f of required) {
    if (!addr[f] || !addr[f].toString().trim()) {
      return `Address field "${f}" is required.`;
    }
  }
  return null;
}

// POST /api/orders — create order from cart (doc §16.1)
async function createOrder(req, res, next) {
  try {
    const { shippingAddress, paymentMethod = 'cod' } = req.body;

    const addressError = validateAddress(shippingAddress);
    if (addressError) return res.status(400).json(failure(addressError));

    if (!['cod', 'razorpay'].includes(paymentMethod)) {
      return res.status(400).json(failure('Invalid payment method.'));
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json(failure('Cart is empty.'));
    }

    // Re-validate stock + build authoritative line items
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.product;
      if (!product || !product.isActive) {
        return res.status(400).json(
          failure(`Product "${cartItem.product?.name || 'unknown'}" is no longer available.`)
        );
      }
      if (cartItem.quantity > product.stock) {
        return res.status(400).json(
          failure(`Only ${product.stock} unit(s) of "${product.name}" available.`)
        );
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0]?.url || '',
        price: product.price,
        quantity: cartItem.quantity,
      });
      subtotal += product.price * cartItem.quantity;
    }

    // Atomically decrement stock for each product (doc §29 — prevent oversell)
    const decremented = [];
    for (const item of orderItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity }, isActive: true },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!updated) {
        // Rollback any decrements we already did
        for (const d of decremented) {
          await Product.findByIdAndUpdate(d.product, { $inc: { stock: d.quantity } });
        }
        return res.status(409).json(failure(`Stock changed for "${item.name}". Please retry.`));
      }
      decremented.push(item);
    }

    const total = subtotal;

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      subtotal: Math.round(subtotal),
      total: Math.round(total),
    });

    // Clear the cart
    cart.items = [];
    await cart.save();

    res.status(201).json(success('Order placed successfully.', { order }));
  } catch (err) {
    next(err);
  }
}

// GET /api/orders/my-orders
async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(success('Orders fetched.', { orders }));
  } catch (err) {
    next(err);
  }
}

// GET /api/orders/:id
async function getOrderById(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json(failure('Order not found.'));

    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superAdmin';
    if (!isOwner && !isAdmin) return res.status(403).json(failure('Access denied.'));

    res.json(success('Order fetched.', { order }));
  } catch (err) {
    next(err);
  }
}

// POST /api/orders/:id/pay-mock — fake payment confirmation
// Simulates a payment gateway callback. Test cards:
//   4000000000000002 -> always fails (for testing the failure path)
//   anything else    -> succeeds
const FAIL_TEST_CARD = '4000000000000002';

async function markOrderPaidMock(req, res, next) {
  try {
    const { cardNumber } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json(failure('Order not found.'));
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json(failure('Access denied.'));
    }
    if (order.paymentStatus === 'paid') {
      return res.status(400).json(failure('Order is already paid.'));
    }
    if (order.paymentMethod !== 'razorpay') {
      return res.status(400).json(failure('This order is not set up for online payment.'));
    }

    const cleanCard = (cardNumber || '').toString().replace(/\s+/g, '');
    if (cleanCard === FAIL_TEST_CARD) {
      order.paymentStatus = 'failed';
      await order.save();
      return res.status(402).json(failure('Payment declined by issuer. Please try another card.'));
    }

    order.paymentStatus = 'paid';
    if (order.orderStatus === 'pending') order.orderStatus = 'processing';
    await order.save();
    res.json(success('Payment successful.', { order }));
  } catch (err) {
    next(err);
  }
}

// PUT /api/orders/:id/cancel — customer cancels their own order
async function cancelOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json(failure('Order not found.'));
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json(failure('Access denied.'));
    }
    if (!['pending', 'processing'].includes(order.orderStatus)) {
      return res.status(400).json(failure(`Cannot cancel an order with status "${order.orderStatus}".`));
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    order.orderStatus = 'cancelled';
    if (order.paymentStatus === 'paid') order.paymentStatus = 'refunded';
    await order.save();

    res.json(success('Order cancelled.', { order }));
  } catch (err) {
    next(err);
  }
}

// Admin: GET /api/admin/orders
async function getAllOrders(req, res, next) {
  try {
    const { status, paymentStatus, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Order.countDocuments(query),
    ]);

    res.json(
      success('Orders fetched.', {
        orders,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      })
    );
  } catch (err) {
    next(err);
  }
}

// Admin: PUT /api/admin/orders/:id/status
async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json(failure('Order not found.'));

    const allowed = STATUS_FLOW[order.orderStatus] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json(
        failure(`Cannot transition from "${order.orderStatus}" to "${status}".`)
      );
    }

    if (status === 'cancelled') {
      // Restore stock if cancelling
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
      if (order.paymentStatus === 'paid') order.paymentStatus = 'refunded';
    }

    order.orderStatus = status;
    await order.save();

    res.json(success('Order status updated.', { order }));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrder, getMyOrders, getOrderById, cancelOrder, markOrderPaidMock,
  getAllOrders, updateOrderStatus,
};
