const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  checkoutInquiry
} = require('../controllers/cartController');
const authenticate = require('../middleware/authMiddleware');

// All cart operations require authentication
router.use(authenticate);

router.get('/', getCart);
router.post('/checkout-inquiry', checkoutInquiry);
router.post('/:productId', addToCart);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;
