const { pool } = require('../config/db');

// @desc    Get user's favourite products
// @route   GET /api/favourites
const getFavourites = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        p.id, p.title, p.description, p.price, p.original_price,
        p.product_condition, p.campus, p.status, p.created_at,
        c.name AS category_name,
        u.full_name AS seller_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) AS primary_image,
        f.created_at AS favourited_at
      FROM favourites f
      JOIN products p ON f.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.seller_id = u.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `;

    const [favourites] = await pool.query(query, [req.user.id]);

    res.json({
      success: true,
      data: favourites
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to favourites
// @route   POST /api/favourites/:productId
const addFavourite = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId, 10);

    const [products] = await pool.query('SELECT id FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    // Insert or ignore if duplicate
    await pool.query(
      'INSERT IGNORE INTO favourites (user_id, product_id) VALUES (?, ?)',
      [req.user.id, productId]
    );

    res.status(201).json({
      success: true,
      message: 'Product saved to favourites.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from favourites
// @route   DELETE /api/favourites/:productId
const removeFavourite = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId, 10);

    await pool.query(
      'DELETE FROM favourites WHERE user_id = ? AND product_id = ?',
      [req.user.id, productId]
    );

    res.json({
      success: true,
      message: 'Product removed from favourites.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if product is favourited by current user
// @route   GET /api/favourites/check/:productId
const checkFavourite = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId, 10);

    const [rows] = await pool.query(
      'SELECT id FROM favourites WHERE user_id = ? AND product_id = ?',
      [req.user.id, productId]
    );

    res.json({
      success: true,
      isFavourited: rows.length > 0
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFavourites,
  addFavourite,
  removeFavourite,
  checkFavourite
};
