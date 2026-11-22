const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { sendPasswordResetEmail } = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'campus_sell_buy_dev_secret_key_8837194726',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { full_name, email, student_id, phone, password, confirm_password, campus } = req.body;

    if (!full_name || !email || !student_id || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required registration fields.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid college email address.'
      });
    }

    if (confirm_password && password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check if email already exists
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user with default 'student' role and 'active' status
    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, student_id, phone, password, campus, role, status)
       VALUES (?, ?, ?, ?, ?, ?, 'student', 'active')`,
      [
        full_name.trim(),
        email.trim().toLowerCase(),
        student_id.trim().toUpperCase(),
        phone.trim(),
        hashedPassword,
        campus ? campus.trim() : 'Main Campus'
      ]
    );

    const userId = result.insertId;
    const token = generateToken(userId);

    const userResponse = {
      id: userId,
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      student_id: student_id.trim().toUpperCase(),
      phone: phone.trim(),
      campus: campus ? campus.trim() : 'Main Campus',
      role: 'student',
      status: 'active'
    };

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Campus Sell & Buy.',
      token,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const [users] = await pool.query(
      'SELECT id, full_name, email, student_id, phone, password, campus, role, status, profile_image FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = users[0];

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by administration. Please contact campus support.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user.id);

    // Omit password from output
    delete user.password;

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

// @desc    Forgot Password - Send reset link
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered email address.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const [users] = await pool.query('SELECT id, full_name, email FROM users WHERE email = ?', [email.trim().toLowerCase()]);

    // For security reasons, don't reveal if user does not exist
    if (users.length === 0) {
      return res.json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been dispatched.'
      });
    }

    const user = users[0];

    // Generate reset token (unhashed for link, hashed in DB)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expireTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      'UPDATE users SET reset_password_token = ?, reset_password_expire = ? WHERE id = ?',
      [hashedToken, expireTime, user.id]
    );

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    try {
      await sendPasswordResetEmail({
        toEmail: user.email,
        resetUrl,
        userName: user.full_name
      });

      res.json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been dispatched.'
      });
    } catch (mailErr) {
      await pool.query(
        'UPDATE users SET reset_password_token = NULL, reset_password_expire = NULL WHERE id = ?',
        [user.id]
      );
      return res.status(500).json({
        success: false,
        message: 'Unable to send password reset email at this time. Please try again later.'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { token, password, confirm_password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required.'
      });
    }

    if (confirm_password && password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const [users] = await pool.query(
      'SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expire > NOW()',
      [hashedToken]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(password, salt);

    await pool.query(
      'UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expire = NULL WHERE id = ?',
      [newHashedPassword, users[0].id]
    );

    res.json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout (clear token client-side)
// @route   POST /api/auth/logout
const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully.'
  });
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  logout
};
