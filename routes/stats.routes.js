const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const protectRoute = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Stats
 *   description: Application statistics
 */

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Get application statistics
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A JSON object with application statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blogs:
 *                   type: integer
 *                 projects:
 *                   type: integer
 *                 skills:
 *                   type: integer
 *                 contacts:
 *                   type: integer
 *       500:
 *         description: Server error
 */
router.get('/', protectRoute, statsController.getStats);

module.exports = router;
