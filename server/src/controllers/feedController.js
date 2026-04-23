const db = require('../db');

// ─────────────────────────────────────────
// GET FEED
// Returns posts from users you follow,
// ordered newest first.
// This is the core social network query.
// ─────────────────────────────────────────
async function getFeed(req, res) {
  try {
    const userId = req.user.id;
    const page   = parseInt(req.query.page) || 1;
    const limit  = 20;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT p.*, u.username, u.avatar_url,
              COUNT(l.id)::int AS like_count,
              BOOL_OR(l.user_id = $1) AS liked_by_me
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN likes l ON p.id = l.post_id
       WHERE p.user_id IN (
         SELECT following_id FROM follows WHERE follower_id = $1
       )
       OR p.user_id = $1
       GROUP BY p.id, u.username, u.avatar_url
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      posts:    result.rows,
      page,
      hasMore: result.rows.length === limit
    });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

// ─────────────────────────────────────────
// GET EXPLORE — all recent posts
// For users who don't follow anyone yet
// ─────────────────────────────────────────
async function getExplore(req, res) {
  try {
    const userId = req.user.id;
    const page   = parseInt(req.query.page) || 1;
    const limit  = 20;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT p.*, u.username, u.avatar_url,
              COUNT(l.id)::int AS like_count,
              BOOL_OR(l.user_id = $1) AS liked_by_me
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN likes l ON p.id = l.post_id
       GROUP BY p.id, u.username, u.avatar_url
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      posts:   result.rows,
      page,
      hasMore: result.rows.length === limit
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getFeed, getExplore };