const { pool } = require('../config/db');

// @desc    Get all categories with active product count
// @route   GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        c.*,
        CAST(COUNT(CASE WHEN p.status = 'active' THEN p.id END) AS UNSIGNED) AS product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `;

    const [categories] = await pool.query(query);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories
};
