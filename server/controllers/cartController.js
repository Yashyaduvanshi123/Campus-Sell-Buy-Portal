const { pool } = require('../config/db');

// @desc    Get user's shopping cart items with full product details
// @route   GET /api/cart
const getCart = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        ci.id AS cart_item_id,
        ci.created_at AS added_at,
        p.id,
        p.title,
        p.description,
        p.price,
        p.original_price,
        p.product_condition,
        p.campus,
        p.status,
        p.allow_whatsapp,
        p.seller_id,
        c.name AS category_name,
        u.full_name AS seller_name,
        u.phone AS seller_phone,
        u.email AS seller_email,
        u.campus AS seller_campus,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) AS primary_image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.seller_id = u.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC
    `;

    const [items] = await pool.query(query, [req.user.id]);

    // Calculate subtotal and identify any sold/inactive items
    let subtotal = 0;
    let availableCount = 0;
    let unavailableCount = 0;

    const formattedItems = items.map((item) => {
      const isAvailable = item.status === 'active';
      if (isAvailable) {
        subtotal += parseFloat(item.price);
        availableCount += 1;
      } else {
        unavailableCount += 1;
      }

      return {
        ...item,
        is_available: isAvailable,
        quantity: 1 // Second-hand marketplace rule: each item is unique 1-of-1
      };
    });

    res.json({
      success: true,
      data: formattedItems,
      summary: {
        total_items: items.length,
        available_items: availableCount,
        unavailable_items: unavailableCount,
        subtotal: parseFloat(subtotal.toFixed(2)),
        total: parseFloat(subtotal.toFixed(2))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a product to user's cart (with uniqueness and availability checks)
// @route   POST /api/cart/:productId
const addToCart = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId, 10);

    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.'
      });
    }

    // 1. Fetch product to verify existence, status, and seller
    const [products] = await pool.query(
      'SELECT id, seller_id, title, price, status FROM products WHERE id = ?',
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const product = products[0];

    // 2. Prevent user from adding their own product
    if (product.seller_id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot add your own listed product to your cart.'
      });
    }

    // 3. Second-hand rule: cannot add sold or unavailable items
    if (product.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This product has already been sold or is currently unavailable.'
      });
    }

    // 4. Duplicate prevention: unique 1-of-1 item rule
    const [existing] = await pool.query(
      'SELECT id FROM cart_items WHERE user_id = ? AND product_id = ?',
      [req.user.id, productId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This product is already in your cart. Second-hand items have a maximum quantity of 1.'
      });
    }

    // 5. Insert into cart_items
    await pool.query(
      'INSERT INTO cart_items (user_id, product_id) VALUES (?, ?)',
      [req.user.id, productId]
    );

    res.status(201).json({
      success: true,
      message: `"${product.title}" added to your cart.`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove an item from user's cart
// @route   DELETE /api/cart/:productId
const removeFromCart = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId, 10);

    await pool.query(
      'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
      [req.user.id, productId]
    );

    res.json({
      success: true,
      message: 'Item removed from cart.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all items from user's cart
// @route   DELETE /api/cart
const clearCart = async (req, res, next) => {
  try {
    await pool.query(
      'DELETE FROM cart_items WHERE user_id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Shopping cart cleared.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm Interest / Proceed to Contact Seller checkout flow
// @route   POST /api/cart/checkout-inquiry
const checkoutInquiry = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { custom_message, selected_product_ids } = req.body;

    // Fetch items currently in user's cart
    let query = `
      SELECT ci.product_id, p.id, p.title, p.price, p.seller_id, p.status, p.campus, u.full_name AS seller_name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN users u ON p.seller_id = u.id
      WHERE ci.user_id = ?
    `;
    const params = [req.user.id];

    if (Array.isArray(selected_product_ids) && selected_product_ids.length > 0) {
      query += ` AND ci.product_id IN (?)`;
      params.push(selected_product_ids);
    }

    const [cartProducts] = await conn.query(query, params);

    if (cartProducts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No eligible items found in your cart.'
      });
    }

    // Availability validation before checkout
    const unavailable = cartProducts.filter((p) => p.status !== 'active');
    if (unavailable.length > 0) {
      const titles = unavailable.map((p) => `"${p.title}"`).join(', ');
      return res.status(400).json({
        success: false,
        message: `Some items in your cart are no longer available: ${titles}. Please remove them before proceeding.`
      });
    }

    await conn.beginTransaction();

    const contactedInquiries = [];

    for (const item of cartProducts) {
      // Formulate standard friendly campus inquiry message
      const inquiryMessage = custom_message && custom_message.trim()
        ? custom_message.trim()
        : `Hi ${item.seller_name}, I am confirming my interest to purchase your listed item "${item.title}" for ₹${item.price} through Campus Market. Could we arrange a safe meet-up on campus (e.g. at ${item.campus || 'the Quad/Library'})?`;

      // Check if inquiry already exists between this buyer and seller for this product
      const [existingInq] = await conn.query(
        'SELECT id FROM inquiries WHERE product_id = ? AND buyer_id = ?',
        [item.id, req.user.id]
      );

      let inquiryId;

      if (existingInq.length > 0) {
        inquiryId = existingInq[0].id;
        // Append message to existing thread
        await conn.query(
          'INSERT INTO inquiry_messages (inquiry_id, sender_id, message) VALUES (?, ?, ?)',
          [inquiryId, req.user.id, inquiryMessage]
        );
      } else {
        // Create new inquiry
        const [result] = await conn.query(
          `INSERT INTO inquiries (product_id, buyer_id, seller_id, message, phone, status)
           VALUES (?, ?, ?, ?, ?, 'pending')`,
          [item.id, req.user.id, item.seller_id, inquiryMessage, req.user.phone || '']
        );
        inquiryId = result.insertId;

        // Insert first thread message
        await conn.query(
          'INSERT INTO inquiry_messages (inquiry_id, sender_id, message) VALUES (?, ?, ?)',
          [inquiryId, req.user.id, inquiryMessage]
        );
      }

      contactedInquiries.push({
        product_id: item.id,
        product_title: item.title,
        seller_name: item.seller_name,
        inquiry_id: inquiryId
      });

      // Remove item from cart now that interest is confirmed
      await conn.query(
        'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
        [req.user.id, item.id]
      );
    }

    await conn.commit();

    res.json({
      success: true,
      message: `Successfully confirmed interest for ${contactedInquiries.length} item(s)! Seller(s) have been contacted.`,
      contacted: contactedInquiries
    });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  checkoutInquiry
};
