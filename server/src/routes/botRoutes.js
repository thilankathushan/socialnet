const express = require('express');
const router  = express.Router();
const { runBots } = require('../controllers/botController');

router.post('/run', runBots);

module.exports = router;