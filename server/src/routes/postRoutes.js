const express    = require('express');
const router     = express.Router();
const { createPost, getPost, deletePost, toggleLike } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const { upload }  = require('../middleware/uploadMiddleware');

router.post('/',           protect, upload.single('image'), createPost);
router.get('/:id',         protect, getPost);
router.delete('/:id',      protect, deletePost);
router.post('/:id/like',   protect, toggleLike);

module.exports = router;