const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/weekly', analyticsController.getWeeklySummary);
router.get('/monthly', analyticsController.getMonthlySummary);
router.get('/heatmap', analyticsController.getHeatmapData);

module.exports = router;
