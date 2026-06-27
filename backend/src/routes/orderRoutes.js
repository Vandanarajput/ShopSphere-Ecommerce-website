const express = require('express');
const {
  createOrder, getMyOrders, getOrderById, cancelOrder, markOrderPaidMock,
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
router.post('/:id/pay-mock', markOrderPaidMock);

module.exports = router;
