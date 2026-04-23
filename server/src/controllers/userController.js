const db = require('../db');

// ─────────────────────────────────────────
// GET USER PROFILE
// ─────────────────────────────────────────
async function getProfile(req, res) {
  try {
    const { username } = req.params;
    const viewerId     = req.user.id;

    // Get user info + follower/following counts + am I following them?
    const userResult = await db.query(
      `SELECT u.id, u.username, u.bio, u.avatar_url, u.created_at,
              COUNT(DISTINCT f1.id)::int AS followers_count,
              COUNT(DISTINCT f2.id)::int AS following_count,
              BOOL_OR(f1.follower_id = $2) AS is_following
       FROM users u
       LEFT JOIN follows f1 ON u.id = f1.following_id
       LEFT JOIN follows f2 ON u.id = f2.follower_id
       WHERE u.username = $1
       GROUP BY u.id`,
      [username.toLowerCase(), viewerId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get user's posts
    const postsResult = await db.query(
      `SELECT p.*, u.username, u.avatar_url,
              COUNT(l.id)::int AS like_count,
              BOOL_OR(l.user_id = $2) AS liked_by_me
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN likes l ON p.id = l.post_id
       WHERE p.user_id = $1
       GROUP BY p.id, u.username, u.avatar_url
       ORDER BY p.created_at DESC
       LIMIT 20`,
      [user.id, viewerId]
    );

    res.json({ user, posts: postsResult.rows });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

// ─────────────────────────────────────────
// UPDATE PROFILE
// ─────────────────────────────────────────
async function updateProfile(req, res) {
  try {
    const userId      = req.user.id;
    const { bio }     = req.body;
    const avatarUrl = req.file ? req.file.path : null;

    const updates = [];
    const values  = [];
    let   index   = 1;

    if (bio !== undefined) {
      updates.push(`bio = $${index++}`);
      values.push(bio.slice(0, 200));
    }
    if (avatarUrl) {
      updates.push(`avatar_url = $${index++}`);
      values.push(avatarUrl);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    values.push(userId);
    const result = await db.query(
      `UPDATE users SET ${updates.join(', ')}
       WHERE id = $${index}
       RETURNING id, username, email, bio, avatar_url`,
      values
    );

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

// ─────────────────────────────────────────
// TOGGLE FOLLOW
// ─────────────────────────────────────────
async function toggleFollow(req, res) {
  try {
    const followerId  = req.user.id;
    const { username } = req.params;

    // Find the user to follow
    const targetUser = await db.query(
      'SELECT id FROM users WHERE username = $1',
      [username.toLowerCase()]
    );
    if (targetUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followingId = targetUser.rows[0].id;

    if (followerId === followingId) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    // Check if already following
    const existing = await db.query(
      'SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );

    if (existing.rows.length > 0) {
      await db.query(
        'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
        [followerId, followingId]
      );
      res.json({ following: false });
    } else {
      await db.query(
        'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)',
        [followerId, followingId]
      );
      res.json({ following: true });
    }
  } catch (error) {
    console.error('Toggle follow error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

// ─────────────────────────────────────────
// SEARCH USERS
// ─────────────────────────────────────────
async function searchUsers(req, res) {
  try {
    const { q }  = req.query;
    const userId = req.user.id;

    if (!q?.trim()) {
      return res.json({ users: [] });
    }

    const result = await db.query(
      `SELECT u.id, u.username, u.bio, u.avatar_url,
              BOOL_OR(f.follower_id = $2) AS is_following
       FROM users u
       LEFT JOIN follows f ON u.id = f.following_id AND f.follower_id = $2
       WHERE u.username ILIKE $1 AND u.id != $2
       GROUP BY u.id
       LIMIT 10`,
      [`%${q.trim()}%`, userId]
    );

    res.json({ users: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getProfile, updateProfile, toggleFollow, searchUsers };