const db      = require('../db');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const axios   = require('axios');
require('dotenv').config();

// ─────────────────────────────────────────
// BOT ACCOUNTS CONFIG
// These must match the accounts you registered
// ─────────────────────────────────────────
const BOT_ACCOUNTS = [
  {
    email:    'tech_updates@socialnet.com',
    password: 'tech_updates1234',
    type:     'tech'
  },
  {
    email:    'world_news@socialnet.com',
    password: 'world_news1234',
    type:     'world'
  },
  {
    email:    'dev_quotes@socialnet.com',
    password: 'dev_quotes1234',
    type:     'quotes'
  }
];

// ─────────────────────────────────────────
// FETCH CONTENT FOR EACH BOT TYPE
// ─────────────────────────────────────────
async function fetchContent(type) {
  try {
    if (type === 'tech') {
      const res = await axios.get(
        `https://newsapi.org/v2/top-headlines?category=technology&pageSize=1&apiKey=${process.env.NEWS_API_KEY}`
      );
      const article = res.data.articles[0];
      if (!article) return null;
      return `📱 ${article.title}\n\n${article.description || ''}\n\n🔗 ${article.url}`.slice(0, 500);
    }

    if (type === 'world') {
      const res = await axios.get(
        `https://newsapi.org/v2/top-headlines?category=general&pageSize=1&apiKey=${process.env.NEWS_API_KEY}`
      );
      const article = res.data.articles[0];
      if (!article) return null;
      return `🌍 ${article.title}\n\n${article.description || ''}\n\n🔗 ${article.url}`.slice(0, 500);
    }

    if (type === 'quotes') {
      // Free API — no key needed
      const res = await axios.get('https://api.adviceslip.com/advice');
      const advice = res.data.slip.advice;
      return `💡 "${advice}"`;
    }
  } catch (err) {
    console.error(`Failed to fetch content for ${type}:`, err.message);
    return null;
  }
}

// ─────────────────────────────────────────
// GET BOT USER ID BY EMAIL
// ─────────────────────────────────────────
async function getBotUserId(email) {
  const result = await db.query(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  return result.rows[0]?.id || null;
}

// ─────────────────────────────────────────
// CREATE POST AS BOT
// ─────────────────────────────────────────
async function createBotPost(userId, content) {
  await db.query(
    'INSERT INTO posts (user_id, content) VALUES ($1, $2)',
    [userId, content]
  );
}

// ─────────────────────────────────────────
// MAIN BOT RUNNER
// Called by the cron job endpoint
// ─────────────────────────────────────────
async function runBots(req, res) {
  // Check the secret to prevent unauthorised calls
  const secret = req.headers['x-bot-secret'] || req.body.secret;
  if (secret !== process.env.BOT_SECRET) {
    return res.status(401).json({ error: 'Unauthorised' });
  }

  const results = [];

  for (const bot of BOT_ACCOUNTS) {
    try {
      const userId = await getBotUserId(bot.email);
      if (!userId) {
        results.push({ type: bot.type, status: 'skipped — user not found' });
        continue;
      }

      const content = await fetchContent(bot.type);
      if (!content) {
        results.push({ type: bot.type, status: 'skipped — no content' });
        continue;
      }

      await createBotPost(userId, content);
      results.push({ type: bot.type, status: 'posted', preview: content.slice(0, 60) });

    } catch (err) {
      results.push({ type: bot.type, status: 'error', error: err.message });
    }
  }

  res.json({ success: true, results, time: new Date().toISOString() });
}

module.exports = { runBots };