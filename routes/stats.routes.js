const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');

/**
 * @swagger
 * tags:
 *   name: Stats
 *   description: Site statistics
 */

/**
 * @swagger
 * /api/stats/main-page-views:
 *   get:
 *     summary: Get main page view count
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Main page view count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 viewCount:
 *                   type: integer
 *       500:
 *         description: Server error
 *   put:
 *     summary: Increment main page view count
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Main page view count incremented successfully
 *       500:
 *         description: Server error
 */
router.get('/main-page-views', statsController.getMainPageViews);
router.put('/main-page-views', statsController.incrementMainPageViews);

module.exports = router;