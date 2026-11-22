const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { uploadImage } = require('../services/storageService');

// @desc    Get user profile with statistics
// @route   GET /api/users/profile
const getProfile = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      'SELECT id, full_name, email, student_id, phone, campus, role, status, profile_image, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const user = users[0];

    // Calculate user dashboard stats
    const [[stats]] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM products WHERE seller_id = ?) AS total_listings,
        (SELECT COUNT(*) FROM products WHERE seller_id = ? AND status = 'active') AS active_listings,
        (SELECT COUNT(*) FROM products WHERE seller_id = ? AND status = 'sold') AS sold_listings,
        (SELECT COUNT(*) FROM favourites WHERE user_id = ?) AS total_favourites,
        (SELECT COUNT(*) FROM inquiries WHERE seller_id = ? AND status = 'pending') AS pending_inquiries
    `, [user.id, user.id, user.id, user.id, user.id]);

    res.json({
      success: true,
      data: {
        user,
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone, campus } = req.body;

    let profileImageUrl = null;
    if (req.file) {
      const uploadResult = await uploadImage(req.file);
      if (uploadResult) {
        profileImageUrl = uploadResult.url;
      }
    }

    await pool.query(`
      UPDATE users SET
        full_name = COALESCE(?, full_name),
        phone = COALESCE(?, phone),
        campus = COALESCE(?, campus),
        profile_image = COALESCE(?, profile_image)
      WHERE id = ?
    `, [
      full_name ? full_name.trim() : null,
      phone ? phone.trim() : null,
      campus ? campus.trim() : null,
      profileImageUrl,
      req.user.id
    ]);

    const [updated] = await pool.query(
      'SELECT id, full_name, email, student_id, phone, campus, role, status, profile_image FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.'
      });
    }

    if (confirm_password && new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation do not match.'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const user = users[0];

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword
};
