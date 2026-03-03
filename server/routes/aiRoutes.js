const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/insights', authMiddleware, aiController.generateInsights);

module.exports = router;
