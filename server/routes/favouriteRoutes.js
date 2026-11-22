const express = require('express');
const router = express.Router();
const {
  getFavourites,
  addFavourite,
  removeFavourite,
  checkFavourite
} = require('../controllers/favouriteController');
const authenticate = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', getFavourites);
router.post('/:productId', addFavourite);
router.delete('/:productId', removeFavourite);
router.get('/check/:productId', checkFavourite);

module.exports = router;
