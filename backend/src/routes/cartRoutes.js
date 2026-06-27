const express = require('express');
const { getCart, addItem, updateItem, removeItem, clearCart } = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware); // all cart routes require login

router.get('/', getCart);
router.post('/items', addItem);
router.put('/items/:productId', updateItem);
router.delete('/items/:productId', removeItem);
router.delete('/', clearCart);

module.exports = router;
