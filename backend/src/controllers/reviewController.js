const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { success, failure } = require('../utils/apiResponse');

async function recomputeProductRating(productId) {
  const agg = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = agg[0] || {};
  await Product.findByIdAndUpdate(productId, {
    ratingAverage: Math.round(avg * 10) / 10,
    ratingCount: count,
  });
}

// GET /api/products/:productId/reviews
async function getProductReviews(req, res, next) {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(success('Reviews fetched.', { reviews }));
  } catch (err) {
    next(err);
  }
}

// POST /api/products/:productId/reviews   (auth required)
async function createReview(req, res, next) {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    const numRating = parseInt(rating);
    if (!Number.isFinite(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json(failure('Rating must be between 1 and 5.'));
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json(failure('Comment is required.'));
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json(failure('Product not found.'));

    // Detect verified purchase
    const purchasedOrder = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      orderStatus: { $in: ['processing', 'shipped', 'delivered'] },
    });

    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) {
      existing.rating = numRating;
      existing.title = title?.trim() || '';
      existing.comment = comment.trim();
      existing.verifiedPurchase = !!purchasedOrder;
      await existing.save();
      await recomputeProductRating(product._id);
      const populated = await existing.populate('user', 'name');
      return res.json(success('Review updated.', { review: populated }));
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating: numRating,
      title: title?.trim() || '',
      comment: comment.trim(),
      verifiedPurchase: !!purchasedOrder,
    });
    await recomputeProductRating(product._id);
    const populated = await review.populate('user', 'name');
    res.status(201).json(success('Review posted.', { review: populated }));
  } catch (err) {
    next(err);
  }
}

// DELETE /api/products/:productId/reviews/:reviewId   (auth — owner or admin)
async function deleteReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json(failure('Review not found.'));

    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superAdmin';
    if (!isOwner && !isAdmin) return res.status(403).json(failure('Access denied.'));

    const productId = review.product;
    await review.deleteOne();
    await recomputeProductRating(productId);

    res.json(success('Review deleted.'));
  } catch (err) {
    next(err);
  }
}

module.exports = { getProductReviews, createReview, deleteReview };
