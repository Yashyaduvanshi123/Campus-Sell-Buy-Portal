const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  getMyProducts
} = require('../controllers/productController');
const authenticate = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Optional auth middleware for viewing product details with unlocked seller info
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campus_sell_buy_dev_secret_key_8837194726');
      const [rows] = await pool.query('SELECT id, role, status FROM users WHERE id = ?', [decoded.id]);
      if (rows.length > 0 && rows[0].status !== 'suspended') {
        req.user = rows[0];
      }
    } catch {
      // Ignore token errors for optional auth
    }
  }
  next();
};

router.get('/', getProducts);
router.get('/my/listings', authenticate, getMyProducts);
router.get('/:id', optionalAuth, getProductById);
router.post('/', authenticate, upload.array('images', 5), createProduct);
router.put('/:id', authenticate, upload.array('images', 5), updateProduct);
router.delete('/:id', authenticate, deleteProduct);
router.patch('/:id/status', authenticate, updateProductStatus);

module.exports = router;
