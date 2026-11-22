const express = require('express');
const router = express.Router();
const {
  createInquiry,
  getMyInquiries,
  getInquiryById,
  addInquiryReply,
  updateInquiryStatus
} = require('../controllers/inquiryController');
const authenticate = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/', createInquiry);
router.get('/my', getMyInquiries);
router.get('/:id', getInquiryById);
router.post('/:id/messages', addInquiryReply);
router.patch('/:id/status', updateInquiryStatus);

module.exports = router;
