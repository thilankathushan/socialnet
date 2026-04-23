const db = require('../db');

async function createPost(req, res) {
  try {
    const { content } = req.body;
    const userId      = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Post content is required' });
    }
    if (content.trim().length > 500) {
      return res.status(400).json({ error: 'Post must be 500 characters or less' });
    }

    const imageUrl = req.file ? req.file.path : '';

    const result = await db.query(
      `INSERT INTO posts (user_id, content, image_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, content.trim(), imageUrl]
    );

    const postResult = await db.query(
      `SELECT p.*, u.username, u.avatar_url,
              0 AS like_count,
              false AS liked_by_me
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json({ post: postResult.rows[0] });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getPost(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      `SELECT p.*, u.username, u.avatar_url,
              COUNT(l.id)::int AS like_count,
              BOOL_OR(l.user_id = $2) AS liked_by_me
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN likes l ON p.id = l.post_id
       WHERE p.id = $1
       GROUP BY p.id, u.username, u.avatar_url`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ post: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function deletePost(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await db.query('SELECT * FROM posts WHERE id = $1', [id]);
    if (post.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (post.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Not authorised to delete this post' });
    }

    await db.query('DELETE FROM posts WHERE id = $1', [id]);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function toggleLike(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await db.query(
      'SELECT id FROM likes WHERE user_id = $1 AND post_id = $2',
      [userId, id]
    );

    if (existing.rows.length > 0) {
      await db.query(
        'DELETE FROM likes WHERE user_id = $1 AND post_id = $2',
        [userId, id]
      );
    } else {
      await db.query(
        'INSERT INTO likes (user_id, post_id) VALUES ($1, $2)',
        [userId, id]
      );
    }

    const countResult = await db.query(
      'SELECT COUNT(*)::int AS like_count FROM likes WHERE post_id = $1',
      [id]
    );

    res.json({
      liked:      existing.rows.length === 0,
      like_count: countResult.rows[0].like_count
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { createPost, getPost, deletePost, toggleLike };