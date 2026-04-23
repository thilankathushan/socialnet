const express    = require('express');
const router     = express.Router();
const { getProfile, updateProfile, toggleFollow, searchUsers } = require('../controllers/userController');
const { getFeed, getExplore } = require('../controllers/feedController');
const { protect }  = require('../middleware/authMiddleware');
const { upload }   = require('../middleware/uploadMiddleware');

router.get('/search',              protect, searchUsers);
router.get('/feed',                protect, getFeed);
router.get('/explore',             protect, getExplore);
router.get('/:username',           protect, getProfile);
router.patch('/me/profile',        protect, upload.single('avatar'), updateProfile);
router.post('/:username/follow',   protect, toggleFollow);

module.exports = router;