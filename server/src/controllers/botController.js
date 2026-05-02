const db      = require('../db');
const axios   = require('axios');
require('dotenv').config();

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

async function fetchContent(type) {
  try {
    if (type === 'tech') {
      const res = await axios.get(
        `https://newsapi.org/v2/top-headlines?category=technology&pageSize=1&apiKey=${process.env.NEWS_API_KEY}`
      );
      const article = res.data.articles[0];
      if (!article) return null;
      return {
        content:  `📱 ${article.title}\n\n${article.description || ''}\n\n🔗 ${article.url}`.slice(0, 500),
        imageUrl: article.urlToImage || ''
      };
    }

    if (type === 'world') {
      const res = await axios.get(
        `https://newsapi.org/v2/top-headlines?category=general&pageSize=1&apiKey=${process.env.NEWS_API_KEY}`
      );
      const article = res.data.articles[0];
      if (!article) return null;
      return {
        content:  `🌍 ${article.title}\n\n${article.description || ''}\n\n🔗 ${article.url}`.slice(0, 500),
        imageUrl: article.urlToImage || ''
      };
    }

    if (type === 'quotes') {
      const res = await axios.get('https://api.adviceslip.com/advice');
      const advice = res.data.slip.advice;
      return {
        content:  `💡 "${advice}"`,
        imageUrl: ''
      };
    }
  } catch (err) {
    console.error(`Failed to fetch content for ${type}:`, err.message);
    return null;
  }
}

async function getBotUserId(email) {
  const result = await db.query(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  return result.rows[0]?.id || null;
}

async function createBotPost(userId, content, imageUrl = '') {
  await db.query(
    'INSERT INTO posts (user_id, content, image_url) VALUES ($1, $2, $3)',
    [userId, content, imageUrl]
  );
}

async function runBots(req, res) {
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

      await createBotPost(userId, content.content, content.imageUrl);
      results.push({ type: bot.type, status: 'posted', preview: content.content.slice(0, 60) });

    } catch (err) {
      results.push({ type: bot.type, status: 'error', error: err.message });
    }
  }

  res.json({ success: true, results, time: new Date().toISOString() });
}

module.exports = { runBots };