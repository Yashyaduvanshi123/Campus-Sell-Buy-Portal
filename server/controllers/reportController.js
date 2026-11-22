const { pool } = require('../config/db');

// @desc    Report an inappropriate product
// @route   POST /api/reports
const createReport = async (req, res, next) => {
  try {
    const { product_id, reason, details } = req.body;

    if (!product_id || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and reason for report are required.'
      });
    }

    const [products] = await pool.query('SELECT id FROM products WHERE id = ?', [product_id]);
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    await pool.query(
      `INSERT INTO reports (reporter_id, product_id, reason, details, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [req.user.id, product_id, reason.trim(), details ? details.trim() : null]
    );

    res.status(201).json({
      success: true,
      message: 'Thank you. Your report has been submitted for campus moderator review.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport
};
