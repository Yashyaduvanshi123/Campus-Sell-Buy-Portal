const { pool } = require('../config/db');

// @desc    Create a product inquiry (Buyer contacting Seller)
// @route   POST /api/inquiries
const createInquiry = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { product_id, message, phone } = req.body;

    if (!product_id || !message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Product ID and inquiry message are required.'
      });
    }

    if (message.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Inquiry message cannot exceed 2000 characters.'
      });
    }

    // Verify product exists and get seller
    const [products] = await conn.query('SELECT id, seller_id, title FROM products WHERE id = ?', [product_id]);
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const product = products[0];

    // Security rule: Cannot inquire on your own product
    if (product.seller_id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send an inquiry on your own product listing.'
      });
    }

    const contactPhone = phone ? phone.trim() : req.user.phone;

    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO inquiries (product_id, buyer_id, seller_id, message, phone, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [product.id, req.user.id, product.seller_id, message.trim(), contactPhone]
    );

    const inquiryId = result.insertId;

    // Insert first message into inquiry_messages thread
    await conn.query(
      `INSERT INTO inquiry_messages (inquiry_id, sender_id, message)
       VALUES (?, ?, ?)`,
      [inquiryId, req.user.id, message.trim()]
    );

    await conn.commit();

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been sent to the seller!',
      inquiryId
    });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

// @desc    Get user's inquiries (both sent as buyer and received as seller) with unread count
// @route   GET /api/inquiries/my
const getMyInquiries = async (req, res, next) => {
  try {
    // Inquiries received as seller
    const [received] = await pool.query(`
      SELECT 
        i.*,
        p.title AS product_title, p.price AS product_price, p.status AS product_status,
        p.allow_whatsapp,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) AS product_image,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) AS primary_image,
        b.full_name AS buyer_name, b.email AS buyer_email, b.phone AS buyer_registered_phone, b.campus AS buyer_campus, b.profile_image AS buyer_profile_image,
        (SELECT COUNT(*) FROM inquiry_messages WHERE inquiry_id = i.id) AS messages_count,
        (SELECT message FROM inquiry_messages WHERE inquiry_id = i.id ORDER BY created_at DESC LIMIT 1) AS latest_message,
        (SELECT created_at FROM inquiry_messages WHERE inquiry_id = i.id ORDER BY created_at DESC LIMIT 1) AS latest_message_at
      FROM inquiries i
      JOIN products p ON i.product_id = p.id
      JOIN users b ON i.buyer_id = b.id
      WHERE i.seller_id = ?
      ORDER BY i.updated_at DESC
    `, [req.user.id]);

    // Inquiries sent as buyer
    const [sent] = await pool.query(`
      SELECT 
        i.*,
        p.title AS product_title, p.price AS product_price, p.status AS product_status,
        p.allow_whatsapp,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) AS product_image,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) AS primary_image,
        s.full_name AS seller_name, s.email AS seller_email, s.phone AS seller_phone, s.campus AS seller_campus, s.profile_image AS seller_profile_image,
        (SELECT COUNT(*) FROM inquiry_messages WHERE inquiry_id = i.id) AS messages_count,
        (SELECT message FROM inquiry_messages WHERE inquiry_id = i.id ORDER BY created_at DESC LIMIT 1) AS latest_message,
        (SELECT created_at FROM inquiry_messages WHERE inquiry_id = i.id ORDER BY created_at DESC LIMIT 1) AS latest_message_at
      FROM inquiries i
      JOIN products p ON i.product_id = p.id
      JOIN users s ON i.seller_id = s.id
      WHERE i.buyer_id = ?
      ORDER BY i.updated_at DESC
    `, [req.user.id]);

    // Calculate unread count for seller
    const unreadCount = received.filter(item => item.status === 'pending').length;

    res.json({
      success: true,
      unread_count: unreadCount,
      data: {
        received,
        sent
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single inquiry details with all threaded messages
// @route   GET /api/inquiries/:id
const getInquiryById = async (req, res, next) => {
  try {
    const inquiryId = parseInt(req.params.id, 10);

    const [inquiries] = await pool.query(`
      SELECT 
        i.*,
        p.id AS product_id, p.title AS product_title, p.price AS product_price, 
        p.original_price AS product_original_price, p.product_condition, p.campus AS product_campus,
        p.status AS product_status, p.allow_whatsapp,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) AS product_image,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) AS primary_image,
        b.id AS buyer_id, b.full_name AS buyer_name, b.email AS buyer_email, b.phone AS buyer_phone, b.campus AS buyer_campus, b.profile_image AS buyer_profile_image,
        s.id AS seller_id, s.full_name AS seller_name, s.email AS seller_email, s.phone AS seller_phone, s.campus AS seller_campus, s.profile_image AS seller_profile_image
      FROM inquiries i
      JOIN products p ON i.product_id = p.id
      JOIN users b ON i.buyer_id = b.id
      JOIN users s ON i.seller_id = s.id
      WHERE i.id = ?
    `, [inquiryId]);

    if (inquiries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found.'
      });
    }

    const inquiry = inquiries[0];

    // Security check: Only the student buyer or seller can access this inquiry
    const isBuyer = inquiry.buyer_id === req.user.id;
    const isSeller = inquiry.seller_id === req.user.id;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this inquiry.'
      });
    }

    // Automatically mark as read if seller views it while status is 'pending'
    if (isSeller && inquiry.status === 'pending') {
      await pool.query('UPDATE inquiries SET status = "read" WHERE id = ?', [inquiryId]);
      inquiry.status = 'read';
    }

    // Fetch conversation thread in chronological order
    const [messages] = await pool.query(`
      SELECT 
        m.id, m.inquiry_id, m.sender_id, m.message, m.created_at,
        u.full_name AS sender_name, u.role AS sender_role, u.profile_image AS sender_profile_image
      FROM inquiry_messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.inquiry_id = ?
      ORDER BY m.created_at ASC
    `, [inquiryId]);

    inquiry.messages = messages;

    // Check WhatsApp contact option
    if (inquiry.allow_whatsapp && inquiry.seller_phone) {
      const cleanPhone = inquiry.seller_phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length >= 10) {
        const prefillMsg = encodeURIComponent(
          `Hi ${inquiry.seller_name}, following up on our inquiry for "${inquiry.product_title}" on Campus Sell & Buy Portal.`
        );
        const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
        inquiry.can_whatsapp = true;
        inquiry.whatsapp_link = `https://wa.me/${formattedPhone}?text=${prefillMsg}`;
      } else {
        inquiry.can_whatsapp = false;
        inquiry.whatsapp_link = null;
      }
    } else {
      inquiry.can_whatsapp = false;
      inquiry.whatsapp_link = null;
    }

    res.json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a reply message in an inquiry conversation
// @route   POST /api/inquiries/:id/messages
const addInquiryReply = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const inquiryId = parseInt(req.params.id, 10);
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot be empty.'
      });
    }

    if (message.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot exceed 2000 characters.'
      });
    }

    // Verify inquiry exists and check permission
    const [inquiries] = await conn.query('SELECT buyer_id, seller_id, status FROM inquiries WHERE id = ?', [inquiryId]);
    if (inquiries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found.'
      });
    }

    const inquiry = inquiries[0];
    const isBuyer = inquiry.buyer_id === req.user.id;
    const isSeller = inquiry.seller_id === req.user.id;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot reply to an inquiry you are not part of.'
      });
    }

    await conn.beginTransaction();

    // Insert reply message
    const [result] = await conn.query(
      `INSERT INTO inquiry_messages (inquiry_id, sender_id, message)
       VALUES (?, ?, ?)`,
      [inquiryId, req.user.id, message.trim()]
    );

    // Update status based on who replied
    let nextStatus = inquiry.status;
    if (isSeller) {
      nextStatus = 'replied';
    } else if (isBuyer && inquiry.status === 'closed') {
      nextStatus = 'pending'; // Re-open if closed
    }

    await conn.query(
      `UPDATE inquiries SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [nextStatus, inquiryId]
    );

    await conn.commit();

    const [newMessage] = await conn.query(`
      SELECT 
        m.id, m.inquiry_id, m.sender_id, m.message, m.created_at,
        u.full_name AS sender_name, u.role AS sender_role, u.profile_image AS sender_profile_image
      FROM inquiry_messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Reply sent successfully.',
      data: newMessage[0],
      inquiryStatus: nextStatus
    });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

// @desc    Update inquiry status (e.g. read, replied, closed)
// @route   PATCH /api/inquiries/:id/status
const updateInquiryStatus = async (req, res, next) => {
  try {
    const inquiryId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!['pending', 'read', 'replied', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value. Must be pending, read, replied, or closed.'
      });
    }

    const [inquiries] = await pool.query('SELECT buyer_id, seller_id FROM inquiries WHERE id = ?', [inquiryId]);
    if (inquiries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found.'
      });
    }

    const inquiry = inquiries[0];
    const isBuyer = inquiry.buyer_id === req.user.id;
    const isSeller = inquiry.seller_id === req.user.id;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    await pool.query('UPDATE inquiries SET status = ? WHERE id = ?', [status, inquiryId]);

    res.json({
      success: true,
      message: `Inquiry marked as ${status}.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInquiry,
  getMyInquiries,
  getInquiryById,
  addInquiryReply,
  updateInquiryStatus
};
