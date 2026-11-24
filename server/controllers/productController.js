const { pool } = require('../config/db');
const { uploadImage, deleteImage } = require('../services/storageService');

// @desc    Get all active products with search, filter, sort, pagination
// @route   GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 12));
    const offset = (page - 1) * limit;

    const {
      search,
      category,
      condition,
      minPrice,
      maxPrice,
      sortBy,
      campus,
      status
    } = req.query;

    const whereClauses = [];
    const params = [];

    // Default to active only unless specifically requested otherwise
    if (status) {
      whereClauses.push('p.status = ?');
      params.push(status);
    } else {
      whereClauses.push('p.status = ?');
      params.push('active');
    }

    if (search && search.trim() !== '') {
      whereClauses.push('(p.title LIKE ? OR p.description LIKE ?)');
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm);
    }

    if (category) {
      if (isNaN(category)) {
        whereClauses.push('c.slug = ?');
        params.push(category);
      } else {
        whereClauses.push('p.category_id = ?');
        params.push(parseInt(category, 10));
      }
    }

    if (condition) {
      whereClauses.push('p.product_condition = ?');
      params.push(condition);
    }

    if (minPrice && !isNaN(minPrice)) {
      whereClauses.push('p.price >= ?');
      params.push(parseFloat(minPrice));
    }

    if (maxPrice && !isNaN(maxPrice)) {
      whereClauses.push('p.price <= ?');
      params.push(parseFloat(maxPrice));
    }

    if (campus && campus.trim() !== '') {
      whereClauses.push('p.campus LIKE ?');
      params.push(`%${campus.trim()}%`);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    let orderBySQL = 'ORDER BY p.created_at DESC';
    if (sortBy === 'price-low') {
      orderBySQL = 'ORDER BY p.price ASC';
    } else if (sortBy === 'price-high') {
      orderBySQL = 'ORDER BY p.price DESC';
    } else if (sortBy === 'popular') {
      orderBySQL = 'ORDER BY p.views_count DESC, p.created_at DESC';
    }

    // Count total products matching filters
    const countSql = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.seller_id = u.id
      ${whereSQL}
    `;
    const [countResult] = await pool.query(countSql, params);
    const total = countResult[0].total;

    // Fetch products
    const querySql = `
      SELECT 
        p.id, p.title, p.description, p.price, p.original_price,
        p.product_condition, p.campus, p.status, p.views_count, p.created_at,
        c.id AS category_id, c.name AS category_name, c.slug AS category_slug,
        u.id AS seller_id, u.full_name AS seller_name, u.campus AS seller_campus,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) AS primary_image
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.seller_id = u.id
      ${whereSQL}
      ${orderBySQL}
      LIMIT ? OFFSET ?
    `;

    const [products] = await pool.query(querySql, [...params, limit, offset]);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product details with images & seller info
// @route   GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id, 10);

    // Increment views count asynchronously
    pool.query('UPDATE products SET views_count = views_count + 1 WHERE id = ?', [productId]).catch(() => {});

    // Fetch product details
    const [products] = await pool.query(`
      SELECT 
        p.*,
        c.name AS category_name, c.slug AS category_slug,
        u.id AS seller_id, u.full_name AS seller_name, u.campus AS seller_campus,
        u.email AS seller_email, u.phone AS seller_phone, u.created_at AS seller_joined_at
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.seller_id = u.id
      WHERE p.id = ?
    `, [productId]);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const product = products[0];

    // Fetch all product images
    const [images] = await pool.query(
      'SELECT id, image_url, public_id, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, id ASC',
      [productId]
    );
    product.images = images;

    // Check if seller phone/email should be displayed (protected route header / req.user)
    // If not authenticated, mask sensitive seller contact info
    if (!req.user) {
      product.seller_phone = null;
      product.seller_email = null;
      product.is_seller_contact_locked = true;
      product.can_whatsapp = false;
      product.whatsapp_link = null;
    } else {
      product.is_seller_contact_locked = false;

      // WhatsApp Contact Option: Only if seller explicitly enabled allow_whatsapp
      if (product.allow_whatsapp && product.seller_phone) {
        // Sanitize phone number to international digits only
        const cleanPhone = product.seller_phone.replace(/[^0-9]/g, '');
        // Validate phone format: minimum 10 digits
        if (cleanPhone.length >= 10) {
          const prefillMsg = encodeURIComponent(
            `Hi ${product.seller_name}, I saw your listing "${product.title}" on Campus Sell & Buy Portal. Is it still available to meet on campus?`
          );
          // If 10 digits without country code, prefix 91 (India) or default international
          const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
          product.can_whatsapp = true;
          product.whatsapp_link = `https://wa.me/${formattedPhone}?text=${prefillMsg}`;
        } else {
          product.can_whatsapp = false;
          product.whatsapp_link = null;
        }
      } else {
        product.can_whatsapp = false;
        product.whatsapp_link = null;
      }
    }

    // Fetch similar products (same category, different id, active)
    const [similarProducts] = await pool.query(`
      SELECT 
        p.id, p.title, p.price, p.original_price, p.product_condition, p.campus,
        c.name AS category_name,
        u.full_name AS seller_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) AS primary_image
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.seller_id = u.id
      WHERE p.category_id = ? AND p.id != ? AND p.status = 'active'
      ORDER BY p.created_at DESC
      LIMIT 4
    `, [product.category_id, productId]);

    product.similarProducts = similarProducts;

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new product listing with image uploads
// @route   POST /api/products
const createProduct = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const {
      title,
      description,
      price,
      original_price,
      category_id,
      product_condition,
      campus,
      allow_whatsapp
    } = req.body;

    if (!title || !description || !price || !category_id || !product_condition) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all mandatory product fields.'
      });
    }

    const parsedPrice = parseFloat(price);
    const parsedOriginalPrice = original_price ? parseFloat(original_price) : null;
    const whatsappOptIn = allow_whatsapp === true || allow_whatsapp === 'true' || allow_whatsapp === '1' || allow_whatsapp === 1 ? 1 : 0;

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid price value.'
      });
    }

    await conn.beginTransaction();

    const [productResult] = await conn.query(
      `INSERT INTO products (seller_id, category_id, title, description, price, original_price, product_condition, campus, allow_whatsapp, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        req.user.id,
        parseInt(category_id, 10),
        title.trim(),
        description.trim(),
        parsedPrice,
        parsedOriginalPrice,
        product_condition,
        campus ? campus.trim() : req.user.campus || 'Main Campus',
        whatsappOptIn
      ]
    );

    const productId = productResult.insertId;

    // Handle uploaded images
    const files = req.files || [];
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const uploadResult = await uploadImage(files[i]);
        if (uploadResult) {
          await conn.query(
            'INSERT INTO product_images (product_id, image_url, public_id, is_primary) VALUES (?, ?, ?, ?)',
            [productId, uploadResult.url, uploadResult.public_id, i === 0 ? 1 : 0]
          );
        }
      }
    } else {
      // Default placeholder image if none provided
      await conn.query(
        'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, 1)',
        [productId, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80']
      );
    }

    await conn.commit();

    res.status(201).json({
      success: true,
      message: 'Product listed successfully!',
      productId
    });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

// @desc    Update an existing product listing
// @route   PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const productId = parseInt(req.params.id, 10);

    const [products] = await conn.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const product = products[0];

    // Authorization check: Only product owner
    if (product.seller_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only edit your own product listings.'
      });
    }

    const {
      title,
      description,
      price,
      original_price,
      category_id,
      product_condition,
      campus,
      allow_whatsapp,
      status
    } = req.body;

    const parsedWhatsapp = allow_whatsapp !== undefined 
      ? (allow_whatsapp === true || allow_whatsapp === 'true' || allow_whatsapp === '1' || allow_whatsapp === 1 ? 1 : 0)
      : null;

    await conn.beginTransaction();

    await conn.query(`
      UPDATE products SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        original_price = ?,
        category_id = COALESCE(?, category_id),
        product_condition = COALESCE(?, product_condition),
        campus = COALESCE(?, campus),
        allow_whatsapp = COALESCE(?, allow_whatsapp),
        status = COALESCE(?, status)
      WHERE id = ?
    `, [
      title ? title.trim() : null,
      description ? description.trim() : null,
      price ? parseFloat(price) : null,
      original_price ? parseFloat(original_price) : null,
      category_id ? parseInt(category_id, 10) : null,
      product_condition || null,
      campus ? campus.trim() : null,
      parsedWhatsapp,
      status || null,
      productId
    ]);

    // If new files were uploaded, add them
    const files = req.files || [];
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const uploadResult = await uploadImage(files[i]);
        if (uploadResult) {
          await conn.query(
            'INSERT INTO product_images (product_id, image_url, public_id, is_primary) VALUES (?, ?, ?, 0)',
            [productId, uploadResult.url, uploadResult.public_id]
          );
        }
      }
    }

    await conn.commit();

    res.json({
      success: true,
      message: 'Product updated successfully.'
    });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

// @desc    Delete a product listing
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id, 10);

    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const product = products[0];

    // Authorization check: Only product owner
    if (product.seller_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only delete your own products.'
      });
    }

    // Fetch and cleanup stored images
    const [images] = await pool.query('SELECT public_id FROM product_images WHERE product_id = ?', [productId]);
    for (const img of images) {
      if (img.public_id) {
        await deleteImage(img.public_id);
      }
    }

    // Cascade deletes handle product_images, favourites, inquiries, reports
    await pool.query('DELETE FROM products WHERE id = ?', [productId]);

    res.json({
      success: true,
      message: 'Product listing removed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product status (e.g. mark as sold or active)
// @route   PATCH /api/products/:id/status
const updateProductStatus = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!['active', 'sold', 'removed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, sold, or removed.'
      });
    }

    const [products] = await pool.query('SELECT seller_id FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    if (products[0].seller_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only update the status of your own products.'
      });
    }

    await pool.query('UPDATE products SET status = ? WHERE id = ?', [status, productId]);

    res.json({
      success: true,
      message: `Product marked as ${status}.`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's products (active and sold)
// @route   GET /api/products/my/listings
const getMyProducts = async (req, res, next) => {
  try {
    const { status } = req.query;
    let whereSQL = 'WHERE p.seller_id = ?';
    const params = [req.user.id];

    if (status && ['active', 'sold'].includes(status)) {
      whereSQL += ' AND p.status = ?';
      params.push(status);
    } else {
      whereSQL += " AND p.status != 'removed'";
    }

    const query = `
      SELECT 
        p.*,
        c.name AS category_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) AS primary_image,
        (SELECT COUNT(*) FROM favourites WHERE product_id = p.id) AS favourites_count,
        (SELECT COUNT(*) FROM inquiries WHERE product_id = p.id) AS inquiries_count
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ${whereSQL}
      ORDER BY p.created_at DESC
    `;

    const [products] = await pool.query(query, params);

    // Fetch live counts for user
    const [counts] = await pool.query(
      `SELECT 
        COUNT(*) AS total_count,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_count,
        SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) AS sold_count
       FROM products 
       WHERE seller_id = ? AND status != 'removed'`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: products,
      counts: {
        total: parseInt(counts[0]?.total_count || 0, 10),
        active: parseInt(counts[0]?.active_count || 0, 10),
        sold: parseInt(counts[0]?.sold_count || 0, 10)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  getMyProducts
};
