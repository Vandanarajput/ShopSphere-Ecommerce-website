const express = require('express');
const { updateProfile, addAddress, updateAddress, deleteAddress } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.put('/profile', updateProfile);
router.post('/addresses', addAddress);
router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);

module.exports = router;
