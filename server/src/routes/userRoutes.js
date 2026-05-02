const express    = require('express');
const router     = express.Router();
const {
  getProfile,
  updateProfile,
  toggleFollow,
  searchUsers,
  updateAccount,
  changePassword,
  deleteAccount,
  getSuggestions
} = require('../controllers/userController');
const { getFeed, getExplore } = require('../controllers/feedController');
const { protect } = require('../middleware/authMiddleware');
const { upload }  = require('../middleware/uploadMiddleware');

// Specific routes MUST come before /:username
router.get('/search',            protect, searchUsers);
router.get('/feed',              protect, getFeed);
router.get('/explore',           protect, getExplore);
router.get('/suggestions',       protect, getSuggestions);
router.patch('/me/profile',      protect, upload.single('avatar'), updateProfile);
router.patch('/me/account',      protect, updateAccount);
router.patch('/me/password',     protect, changePassword);
router.delete('/me',             protect, deleteAccount);

// Dynamic route MUST come last
router.get('/:username',         protect, getProfile);
router.post('/:username/follow', protect, toggleFollow);

module.exports = router;