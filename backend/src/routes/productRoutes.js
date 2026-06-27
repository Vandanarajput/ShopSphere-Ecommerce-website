const express = require('express');
const {
  getProducts, getProductById,
  createProduct, updateProduct, deleteProduct,
  uploadProductImages, deleteProductImage,
} = require('../controllers/productController');
const {
  getProductReviews, createReview, deleteReview,
} = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Reviews (public read, auth-required write/delete)
router.get('/:productId/reviews', getProductReviews);
router.post('/:productId/reviews', authMiddleware, createReview);
router.delete('/:productId/reviews/:reviewId', authMiddleware, deleteReview);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, upload.array('images', 5), createProduct);
router.put('/:id', authMiddleware, adminMiddleware, updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);
router.post('/:id/images', authMiddleware, adminMiddleware, upload.array('images', 5), uploadProductImages);
router.delete('/:id/images', authMiddleware, adminMiddleware, deleteProductImage);

module.exports = router;
