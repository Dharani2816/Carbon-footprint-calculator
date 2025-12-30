const express = require('express');
const router = express.Router();
const footprintController = require('../controllers/footprintController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, footprintController.saveFootprint);
router.get('/history', authMiddleware, footprintController.getHistory);
router.get('/latest', authMiddleware, footprintController.getLatestFootprint);

module.exports = router;
